import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MessageCircle, Send, ArrowLeft, User, Truck, Search } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import { useMessages } from '@/contexts/MessageContext';
import { useOrders } from '@/contexts/OrderContext';
import { useShops } from '@/contexts/ShopContext';
import { Colors } from '@/constants/colors';
import { Conversation } from '@/types';

export default function ShopMessagesScreen() {
  const router = useRouter();
  const { user, allUsers } = useAuth();
  const { getConversationsForUser, getConversationMessages, sendMessage, markConversationRead, getOrCreateConversation } = useMessages();
  const { orders } = useOrders();
  const { getShopByOwner } = useShops();

  const [selectedConvo, setSelectedConvo] = useState<Conversation | null>(null);
  const [messageText, setMessageText] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showNewChat, setShowNewChat] = useState<boolean>(false);
  const scrollRef = useRef<ScrollView>(null);

  const shop = getShopByOwner(user?.id ?? '');
  const conversations = getConversationsForUser(user?.id ?? '');
  const convoMessages = selectedConvo ? getConversationMessages(selectedConvo.id) : [];

  const shopOrders = useMemo(() => {
    if (!shop) return [];
    return orders.filter((o) => o.shopId === shop.id);
  }, [orders, shop]);

  const contactableUsers = useMemo(() => {
    const userIds = new Set<string>();
    shopOrders.forEach((o) => {
      if (o.customerId) userIds.add(o.customerId);
      if (o.riderId) userIds.add(o.riderId);
    });
    return allUsers.filter((u) => userIds.has(u.id) && u.id !== user?.id);
  }, [shopOrders, allUsers, user]);

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
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
  }, [convoMessages.length]);

  const handleSend = useCallback(async () => {
    if (!messageText.trim() || !selectedConvo || !user) return;
    const otherParticipant = selectedConvo.participants.find((p) => p.id !== user.id);
    if (!otherParticipant) return;

    await sendMessage(
      selectedConvo.id,
      user.id,
      user.name,
      user.role,
      otherParticipant.id,
      otherParticipant.name,
      messageText.trim(),
    );
    setMessageText('');
  }, [messageText, selectedConvo, user, sendMessage]);

  const handleStartChat = useCallback(async (contactId: string) => {
    if (!user) return;
    const contact = allUsers.find((u) => u.id === contactId);
    if (!contact) return;

    const convo = await getOrCreateConversation(
      { id: user.id, name: user.name, role: user.role },
      { id: contact.id, name: contact.name, role: contact.role },
    );
    setSelectedConvo(convo);
    setShowNewChat(false);
    setSearchQuery('');
  }, [user, allUsers, getOrCreateConversation]);

  const formatTime = (dateStr: string) => {
    const d = new Date(dateStr);
    const now = new Date();
    if (d.toDateString() === now.toDateString()) {
      return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    }
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const getOtherParticipant = (convo: Conversation) => {
    return convo.participants.find((p) => p.id !== user?.id);
  };

  if (selectedConvo) {
    const other = getOtherParticipant(selectedConvo);
    return (
      <View style={styles.container}>
        <SafeAreaView edges={['top']} style={styles.chatHeaderWrap}>
          <View style={styles.chatHeader}>
            <TouchableOpacity onPress={() => setSelectedConvo(null)} style={styles.backBtn} activeOpacity={0.7}>
              <ArrowLeft size={22} color={Colors.text} />
            </TouchableOpacity>
            <View style={styles.chatHeaderInfo}>
              <Text style={styles.chatHeaderName}>{other?.name ?? 'Chat'}</Text>
              <View style={styles.roleBadge}>
                {other?.role === 'rider' ? <Truck size={10} color={Colors.rider} /> : <User size={10} color={Colors.primary} />}
                <Text style={[styles.roleText, { color: other?.role === 'rider' ? Colors.rider : Colors.primary }]}>
                  {other?.role === 'rider' ? 'Rider' : 'Customer'}
                </Text>
              </View>
            </View>
          </View>
        </SafeAreaView>

        <KeyboardAvoidingView
          style={styles.chatBody}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={0}
        >
          <ScrollView
            ref={scrollRef}
            style={styles.messagesScroll}
            contentContainerStyle={styles.messagesContent}
            showsVerticalScrollIndicator={false}
          >
            {convoMessages.length === 0 && (
              <View style={styles.emptyChat}>
                <MessageCircle size={40} color={Colors.textTertiary} />
                <Text style={styles.emptyChatText}>Start a conversation</Text>
              </View>
            )}
            {convoMessages.map((msg) => {
              const isMine = msg.senderId === user?.id;
              return (
                <View key={msg.id} style={[styles.msgRow, isMine && styles.msgRowMine]}>
                  <View style={[styles.msgBubble, isMine ? styles.msgBubbleMine : styles.msgBubbleOther]}>
                    <Text style={[styles.msgText, isMine && styles.msgTextMine]}>{msg.text}</Text>
                    <Text style={[styles.msgTime, isMine && styles.msgTimeMine]}>{formatTime(msg.createdAt)}</Text>
                  </View>
                </View>
              );
            })}
          </ScrollView>

          <SafeAreaView edges={['bottom']} style={styles.inputBarWrap}>
            <View style={styles.inputBar}>
              <TextInput
                style={styles.messageInput}
                placeholder="Type a message..."
                placeholderTextColor={Colors.textTertiary}
                value={messageText}
                onChangeText={setMessageText}
                multiline
                maxLength={500}
              />
              <TouchableOpacity
                style={[styles.sendBtn, !messageText.trim() && styles.sendBtnDisabled]}
                onPress={handleSend}
                disabled={!messageText.trim()}
                activeOpacity={0.8}
              >
                <Send size={18} color={messageText.trim() ? Colors.white : Colors.textTertiary} />
              </TouchableOpacity>
            </View>
          </SafeAreaView>
        </KeyboardAvoidingView>
      </View>
    );
  }

  if (showNewChat) {
    return (
      <View style={styles.container}>
        <SafeAreaView edges={['top']} style={styles.headerWrap}>
          <View style={styles.newChatHeader}>
            <TouchableOpacity onPress={() => { setShowNewChat(false); setSearchQuery(''); }} activeOpacity={0.7}>
              <ArrowLeft size={22} color={Colors.text} />
            </TouchableOpacity>
            <Text style={styles.title}>New Message</Text>
          </View>
          <View style={styles.searchBar}>
            <Search size={18} color={Colors.textTertiary} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search customers or riders..."
              placeholderTextColor={Colors.textTertiary}
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoFocus
            />
          </View>
        </SafeAreaView>

        <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
          {filteredContacts.map((contact) => (
            <TouchableOpacity
              key={contact.id}
              style={styles.contactItem}
              onPress={() => handleStartChat(contact.id)}
              activeOpacity={0.7}
            >
              <View style={[styles.contactAvatar, { backgroundColor: contact.role === 'rider' ? Colors.riderLight : Colors.primaryFaded }]}>
                {contact.role === 'rider' ? <Truck size={18} color={Colors.rider} /> : <User size={18} color={Colors.primary} />}
              </View>
              <View style={styles.contactInfo}>
                <Text style={styles.contactName}>{contact.name}</Text>
                <Text style={styles.contactRole}>{contact.role === 'rider' ? 'Rider' : 'Customer'}</Text>
              </View>
            </TouchableOpacity>
          ))}
          {filteredContacts.length === 0 && (
            <View style={styles.emptyState}>
              <User size={40} color={Colors.textTertiary} />
              <Text style={styles.emptyStateText}>No contacts found</Text>
              <Text style={styles.emptyStateSubtext}>Contacts appear from your orders</Text>
            </View>
          )}
        </ScrollView>
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
          <TouchableOpacity style={styles.newChatBtn} onPress={() => setShowNewChat(true)} activeOpacity={0.7}>
            <MessageCircle size={16} color={Colors.white} />
            <Text style={styles.newChatBtnText}>New</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {conversations.map((convo) => {
          const other = getOtherParticipant(convo);
          const unread = convo.unreadCount[user?.id ?? ''] ?? 0;

          return (
            <TouchableOpacity
              key={convo.id}
              style={styles.convoItem}
              onPress={() => setSelectedConvo(convo)}
              activeOpacity={0.7}
            >
              <View style={[styles.convoAvatar, { backgroundColor: other?.role === 'rider' ? Colors.riderLight : Colors.primaryFaded }]}>
                {other?.role === 'rider' ? <Truck size={20} color={Colors.rider} /> : <User size={20} color={Colors.primary} />}
              </View>
              <View style={styles.convoInfo}>
                <View style={styles.convoTop}>
                  <Text style={[styles.convoName, unread > 0 && styles.convoNameUnread]}>{other?.name ?? 'Unknown'}</Text>
                  {convo.lastMessageAt && (
                    <Text style={styles.convoTime}>{formatTime(convo.lastMessageAt)}</Text>
                  )}
                </View>
                <View style={styles.convoBottom}>
                  <Text style={[styles.convoLastMsg, unread > 0 && styles.convoLastMsgUnread]} numberOfLines={1}>
                    {convo.lastMessage ?? 'No messages yet'}
                  </Text>
                  {unread > 0 && (
                    <View style={styles.unreadBadge}>
                      <Text style={styles.unreadText}>{unread}</Text>
                    </View>
                  )}
                </View>
              </View>
            </TouchableOpacity>
          );
        })}

        {conversations.length === 0 && (
          <View style={styles.emptyState}>
            <MessageCircle size={48} color={Colors.textTertiary} />
            <Text style={styles.emptyStateText}>No messages yet</Text>
            <Text style={styles.emptyStateSubtext}>Start a conversation with a customer or rider</Text>
            <TouchableOpacity style={styles.startChatBtn} onPress={() => setShowNewChat(true)} activeOpacity={0.7}>
              <Text style={styles.startChatBtnText}>Start New Chat</Text>
            </TouchableOpacity>
          </View>
        )}
        <View style={{ height: 30 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  headerWrap: { backgroundColor: Colors.white, paddingBottom: 12 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 8, gap: 12 },
  backBtn: { padding: 4 },
  title: { fontSize: 24, fontWeight: '800' as const, color: Colors.text, flex: 1 },
  newChatBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: Colors.primary, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10,
  },
  newChatBtnText: { fontSize: 13, fontWeight: '700' as const, color: Colors.white },
  scroll: { flex: 1 },
  convoItem: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    backgroundColor: Colors.white, paddingHorizontal: 20, paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: Colors.borderLight,
  },
  convoAvatar: { width: 48, height: 48, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  convoInfo: { flex: 1 },
  convoTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  convoName: { fontSize: 15, fontWeight: '600' as const, color: Colors.text },
  convoNameUnread: { fontWeight: '800' as const },
  convoTime: { fontSize: 12, color: Colors.textTertiary },
  convoBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  convoLastMsg: { fontSize: 13, color: Colors.textSecondary, flex: 1, marginRight: 8 },
  convoLastMsgUnread: { color: Colors.text, fontWeight: '600' as const },
  unreadBadge: {
    backgroundColor: Colors.primary, minWidth: 20, height: 20, borderRadius: 10,
    justifyContent: 'center', alignItems: 'center', paddingHorizontal: 6,
  },
  unreadText: { fontSize: 11, fontWeight: '700' as const, color: Colors.white },
  emptyState: { alignItems: 'center', paddingTop: 80, gap: 10, paddingHorizontal: 40 },
  emptyStateText: { fontSize: 18, fontWeight: '700' as const, color: Colors.text },
  emptyStateSubtext: { fontSize: 14, color: Colors.textSecondary, textAlign: 'center' as const },
  startChatBtn: { backgroundColor: Colors.primary, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12, marginTop: 12 },
  startChatBtnText: { fontSize: 14, fontWeight: '700' as const, color: Colors.white },
  newChatHeader: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingHorizontal: 20, paddingTop: 8 },
  searchBar: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    marginHorizontal: 20, marginTop: 12, backgroundColor: Colors.background,
    borderRadius: 12, paddingHorizontal: 14, height: 44, borderWidth: 1, borderColor: Colors.border,
  },
  searchInput: { flex: 1, fontSize: 14, color: Colors.text },
  contactItem: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    backgroundColor: Colors.white, paddingHorizontal: 20, paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: Colors.borderLight,
  },
  contactAvatar: { width: 44, height: 44, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  contactInfo: { flex: 1 },
  contactName: { fontSize: 15, fontWeight: '600' as const, color: Colors.text },
  contactRole: { fontSize: 12, color: Colors.textSecondary, marginTop: 2 },
  chatHeaderWrap: { backgroundColor: Colors.white, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: Colors.borderLight },
  chatHeader: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingHorizontal: 20, paddingTop: 8 },
  backBtn: { width: 36, height: 36, borderRadius: 10, backgroundColor: Colors.background, justifyContent: 'center', alignItems: 'center' },
  chatHeaderInfo: { flex: 1 },
  chatHeaderName: { fontSize: 17, fontWeight: '700' as const, color: Colors.text },
  roleBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  roleText: { fontSize: 11, fontWeight: '600' as const },
  chatBody: { flex: 1 },
  messagesScroll: { flex: 1 },
  messagesContent: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 8 },
  emptyChat: { alignItems: 'center', paddingTop: 60, gap: 10 },
  emptyChatText: { fontSize: 15, color: Colors.textTertiary },
  msgRow: { marginBottom: 8, alignItems: 'flex-start' as const },
  msgRowMine: { alignItems: 'flex-end' as const },
  msgBubble: { maxWidth: '78%', borderRadius: 18, paddingHorizontal: 14, paddingVertical: 10 },
  msgBubbleMine: { backgroundColor: Colors.primary, borderBottomRightRadius: 4 },
  msgBubbleOther: { backgroundColor: Colors.white, borderBottomLeftRadius: 4, borderWidth: 1, borderColor: Colors.borderLight },
  msgText: { fontSize: 14, color: Colors.text, lineHeight: 20 },
  msgTextMine: { color: Colors.white },
  msgTime: { fontSize: 10, color: Colors.textTertiary, marginTop: 4, alignSelf: 'flex-end' as const },
  msgTimeMine: { color: 'rgba(255,255,255,0.7)' },
  inputBarWrap: { backgroundColor: Colors.white, borderTopWidth: 1, borderTopColor: Colors.borderLight },
  inputBar: { flexDirection: 'row', alignItems: 'flex-end', gap: 8, paddingHorizontal: 16, paddingVertical: 8 },
  messageInput: {
    flex: 1, backgroundColor: Colors.background, borderRadius: 20, paddingHorizontal: 16,
    paddingTop: 10, paddingBottom: 10, fontSize: 14, color: Colors.text, maxHeight: 100,
    borderWidth: 1, borderColor: Colors.border,
  },
  sendBtn: {
    width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.primary,
    justifyContent: 'center', alignItems: 'center',
  },
  sendBtnDisabled: { backgroundColor: Colors.background },
});
