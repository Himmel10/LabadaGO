import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MessageCircle, Send, ArrowLeft, Store, User, Search } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import { useMessages } from '@/contexts/MessageContext';
import { useOrders } from '@/contexts/OrderContext';
import { useShops } from '@/contexts/ShopContext';
import { Colors } from '@/constants/colors';
import { Conversation } from '@/types';

export default function RiderMessagesScreen() {
  const router = useRouter();
  const { user, allUsers } = useAuth();
  const { getConversationsForUser, getConversationMessages, sendMessage, markConversationRead, getOrCreateConversation } = useMessages();
  const { orders } = useOrders();
  const { shops } = useShops();

  const [selectedConvo, setSelectedConvo] = useState<Conversation | null>(null);
  const [messageText, setMessageText] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const scrollRef = useRef<ScrollView>(null);

  const conversations = getConversationsForUser(user?.id ?? '');
  const convoMessages = selectedConvo ? getConversationMessages(selectedConvo.id) : [];

  // Get shops and customers from orders
  const contactableUsers = useMemo(() => {
    const userIds = new Set<string>();
    orders.forEach((o) => {
      if (o.customerId) userIds.add(o.customerId);
      if (o.shopId) {
        const shop = shops.find((s) => s.id === o.shopId);
        if (shop) userIds.add(shop.ownerId);
      }
    });
    return allUsers.filter((u) => userIds.has(u.id) && u.id !== user?.id);
  }, [orders, shops, allUsers, user]);

  const filteredContacts = useMemo(() => {
    if (!searchQuery.trim()) return contactableUsers;
    const q = searchQuery.toLowerCase();
    return contactableUsers.filter((u) => u.name.toLowerCase().includes(q) || u.role.toLowerCase().includes(q));
  }, [contactableUsers, searchQuery]);

  useEffect(() => {
    if (selectedConvo && user) {
      markConversationRead(selectedConvo.id, user.id);
    }
  }, [selectedConvo, convoMessages.length, markConversationRead, user]);

  useEffect(() => {
    scrollRef.current?.scrollToEnd({ animated: true });
  }, [convoMessages]);

  const handleSendMessage = useCallback(async () => {
    if (!messageText.trim() || !selectedConvo || !user) return;
    sendMessage(selectedConvo.id, user.id, messageText);
    setMessageText('');
  }, [messageText, selectedConvo, user, sendMessage]);

  const handleStartConversation = async (contactId: string) => {
    const convo = getOrCreateConversation(user?.id ?? '', contactId);
    setSelectedConvo(convo);
    setSearchQuery('');
  };

  const getRoleIcon = (role: string) => {
    return role === 'shop_owner' ? <Store size={16} color={Colors.primary} /> : <User size={16} color={Colors.primary} />;
  };

  if (selectedConvo) {
    const otherUser = allUsers.find((u) => [selectedConvo.userId1, selectedConvo.userId2].includes(u.id) && u.id !== user?.id);
    return (
      <View style={styles.container}>
        <SafeAreaView edges={['top']} style={styles.chatHeader}>
          <TouchableOpacity onPress={() => setSelectedConvo(null)} activeOpacity={0.7}>
            <ArrowLeft size={24} color={Colors.text} />
          </TouchableOpacity>
          <View style={styles.chatHeaderInfo}>
            <Text style={styles.chatHeaderName}>{otherUser?.name}</Text>
            <Text style={styles.chatHeaderRole}>{otherUser?.role.replace('_', ' ')}</Text>
          </View>
          <View style={{ width: 24 }} />
        </SafeAreaView>

        <ScrollView ref={scrollRef} style={styles.messagesContainer} showsVerticalScrollIndicator={false}>
          {convoMessages.length === 0 ? (
            <View style={styles.emptyChat}>
              <MessageCircle size={48} color={Colors.textTertiary} />
              <Text style={styles.emptyChatText}>Start the conversation</Text>
            </View>
          ) : (
            convoMessages.map((msg) => (
              <View key={msg.id} style={[styles.messageBubble, msg.senderId === user?.id ? styles.sentBubble : styles.receivedBubble]}>
                <Text style={[styles.messageText, msg.senderId === user?.id ? styles.sentText : styles.receivedText]}>
                  {msg.content}
                </Text>
              </View>
            ))
          )}
        </ScrollView>

        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.inputArea}>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Type a message..."
              placeholderTextColor={Colors.textTertiary}
              value={messageText}
              onChangeText={setMessageText}
              multiline
            />
            <TouchableOpacity style={styles.sendBtn} onPress={handleSendMessage} activeOpacity={0.7}>
              <Send size={20} color={Colors.white} />
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <SafeAreaView edges={['top']} style={styles.headerWrap}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.7}>
            <ArrowLeft size={22} color={Colors.text} />
          </TouchableOpacity>
          <Text style={styles.title}>Messages</Text>
        </View>
      </SafeAreaView>

      <View style={styles.searchContainer}>
        <Search size={18} color={Colors.textTertiary} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search conversations..."
          placeholderTextColor={Colors.textTertiary}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {conversations.length > 0 && !searchQuery && (
          <>
            <Text style={styles.sectionTitle}>Recent Conversations</Text>
            {conversations.map((convo) => {
              const otherUserId = convo.userId1 === user?.id ? convo.userId2 : convo.userId1;
              const otherUser = allUsers.find((u) => u.id === otherUserId);
              const unreadCount = convo.unreadCounts?.[user?.id ?? ''] ?? 0;
              return (
                <TouchableOpacity
                  key={convo.id}
                  style={styles.conversationItem}
                  onPress={() => setSelectedConvo(convo)}
                  activeOpacity={0.7}
                >
                  <View style={styles.convoInfo}>
                    <View style={styles.nameRow}>
                      {getRoleIcon(otherUser?.role ?? '')}
                      <Text style={styles.convoName}>{otherUser?.name}</Text>
                    </View>
                    <Text style={styles.convoPreview} numberOfLines={1}>{convo.lastMessage}</Text>
                  </View>
                  {unreadCount > 0 && (
                    <View style={styles.unreadBadge}>
                      <Text style={styles.unreadBadgeText}>{unreadCount > 9 ? '9+' : unreadCount}</Text>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </>
        )}

        {(searchQuery || conversations.length === 0) && (
          <>
            <Text style={styles.sectionTitle}>{searchQuery ? 'Search Results' : 'Start a Conversation'}</Text>
            {filteredContacts.length === 0 ? (
              <View style={styles.emptyState}>
                <MessageCircle size={48} color={Colors.textTertiary} />
                <Text style={styles.emptyStateText}>{searchQuery ? 'No contacts found' : 'No conversations yet'}</Text>
              </View>
            ) : (
              filteredContacts.map((contact) => (
                <TouchableOpacity
                  key={contact.id}
                  style={styles.contactItem}
                  onPress={() => handleStartConversation(contact.id)}
                  activeOpacity={0.7}
                >
                  <View style={styles.contactInfo}>
                    <View style={styles.contactRow}>
                      {getRoleIcon(contact.role)}
                      <Text style={styles.contactName}>{contact.name}</Text>
                    </View>
                    <Text style={styles.contactRole}>{contact.role.replace('_', ' ')}</Text>
                  </View>
                </TouchableOpacity>
              ))
            )}
          </>
        )}

        <View style={{ height: 20 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  headerWrap: { backgroundColor: Colors.white, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: Colors.borderLight },
  headerRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingTop: 8, gap: 12 },
  backBtn: { padding: 4 },
  title: { fontSize: 24, fontWeight: '800' as const, color: Colors.text, flex: 1 },
  header: { backgroundColor: Colors.white, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: Colors.borderLight },
  searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.white, marginHorizontal: 20, marginTop: 12, marginBottom: 8, paddingHorizontal: 12, paddingVertical: 10, borderRadius: 10, borderWidth: 1, borderColor: Colors.borderLight, gap: 8 },
  searchInput: { flex: 1, fontSize: 14, color: Colors.text },
  scroll: { flex: 1, paddingHorizontal: 20 },
  sectionTitle: { fontSize: 14, fontWeight: '700' as const, color: Colors.text, marginTop: 16, marginBottom: 10 },
  conversationItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: Colors.white, padding: 14, borderRadius: 12, marginBottom: 8, borderWidth: 1, borderColor: Colors.borderLight },
  convoInfo: { flex: 1 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
  convoName: { fontSize: 15, fontWeight: '600' as const, color: Colors.text },
  convoPreview: { fontSize: 13, color: Colors.textSecondary },
  unreadBadge: { backgroundColor: Colors.primary, borderRadius: 12, paddingHorizontal: 8, paddingVertical: 4 },
  unreadBadgeText: { fontSize: 12, fontWeight: '700' as const, color: Colors.white },
  contactItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.white, padding: 14, borderRadius: 12, marginBottom: 8, borderWidth: 1, borderColor: Colors.borderLight },
  contactInfo: { flex: 1 },
  contactRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  contactName: { fontSize: 15, fontWeight: '600' as const, color: Colors.text },
  contactRole: { fontSize: 12, color: Colors.textSecondary },
  emptyState: { alignItems: 'center', paddingVertical: 40, gap: 12 },
  emptyStateText: { fontSize: 16, color: Colors.textSecondary },
  chatHeader: { backgroundColor: Colors.white, paddingHorizontal: 20, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: Colors.borderLight, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  chatHeaderInfo: { flex: 1, alignItems: 'center' },
  chatHeaderName: { fontSize: 16, fontWeight: '700' as const, color: Colors.text },
  chatHeaderRole: { fontSize: 12, color: Colors.textSecondary },
  messagesContainer: { flex: 1, padding: 20 },
  messageBubble: { marginBottom: 10, maxWidth: '85%' },
  sentBubble: { alignSelf: 'flex-end', backgroundColor: Colors.primary, paddingHorizontal: 14, paddingVertical: 10, borderRadius: 12 },
  receivedBubble: { alignSelf: 'flex-start', backgroundColor: Colors.white, paddingHorizontal: 14, paddingVertical: 10, borderRadius: 12, borderWidth: 1, borderColor: Colors.borderLight },
  messageText: { fontSize: 14 },
  sentText: { color: Colors.white },
  receivedText: { color: Colors.text },
  emptyChat: { alignItems: 'center', justifyContent: 'center', paddingVertical: 60, gap: 12 },
  emptyChatText: { fontSize: 16, color: Colors.textSecondary },
  inputArea: { backgroundColor: Colors.white, paddingHorizontal: 20, paddingVertical: 12, borderTopWidth: 1, borderTopColor: Colors.borderLight },
  inputContainer: { flexDirection: 'row', alignItems: 'flex-end', gap: 10 },
  input: { flex: 1, backgroundColor: Colors.background, borderRadius: 20, paddingHorizontal: 16, paddingVertical: 10, fontSize: 14, color: Colors.text, maxHeight: 100 },
  sendBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.primary, justifyContent: 'center', alignItems: 'center' },
});
