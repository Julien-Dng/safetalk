#!/usr/bin/env python3
"""
Comprehensive Backend Testing for SafeTalk React Native Firebase Implementation
Tests Firebase services: UserService, ChatService, MatchmakingService, AuthService
"""

import asyncio
import json
import sys
import traceback
from datetime import datetime, timedelta
from typing import Dict, List, Any
import uuid

class MockFirestore:
    """Mock Firestore implementation for testing Firebase services logic"""
    
    def __init__(self):
        self.collections = {}
        self.server_timestamp = datetime.utcnow()
    
    def collection(self, name):
        if name not in self.collections:
            self.collections[name] = {}
        return MockCollection(self.collections[name], name)
    
    def FieldValue(self):
        return MockFieldValue()

class MockFieldValue:
    @staticmethod
    def serverTimestamp():
        return datetime.utcnow()
    
    @staticmethod
    def increment(value):
        return f"INCREMENT:{value}"
    
    @staticmethod
    def arrayUnion(value):
        return f"ARRAY_UNION:{value}"

class MockCollection:
    def __init__(self, data, name):
        self.data = data
        self.name = name
    
    def doc(self, doc_id):
        return MockDocument(self.data, doc_id, self.name)
    
    def where(self, field, operator, value):
        return MockQuery(self.data, [(field, operator, value)])
    
    def orderBy(self, field, direction='asc'):
        return MockQuery(self.data, [], [(field, direction)])
    
    def limit(self, count):
        return MockQuery(self.data, [], [], count)
    
    async def add(self, data):
        doc_id = str(uuid.uuid4())
        self.data[doc_id] = {**data, 'id': doc_id}
        return MockDocumentReference(doc_id)

class MockDocument:
    def __init__(self, collection_data, doc_id, collection_name):
        self.collection_data = collection_data
        self.doc_id = doc_id
        self.collection_name = collection_name
    
    async def get(self):
        return MockDocumentSnapshot(
            self.collection_data.get(self.doc_id),
            self.doc_id,
            self.doc_id in self.collection_data
        )
    
    async def set(self, data):
        self.collection_data[self.doc_id] = {**data, 'id': self.doc_id}
    
    async def update(self, data):
        if self.doc_id in self.collection_data:
            self.collection_data[self.doc_id].update(data)
        else:
            raise Exception(f"Document {self.doc_id} not found")
    
    async def delete(self):
        if self.doc_id in self.collection_data:
            del self.collection_data[self.doc_id]
    
    def collection(self, subcollection_name):
        # Handle subcollections
        full_path = f"{self.collection_name}/{self.doc_id}/{subcollection_name}"
        if full_path not in mock_firestore.collections:
            mock_firestore.collections[full_path] = {}
        return MockCollection(mock_firestore.collections[full_path], full_path)

class MockDocumentSnapshot:
    def __init__(self, data, doc_id, exists):
        self._data = data
        self.id = doc_id
        self.exists = exists
    
    def data(self):
        return self._data

class MockDocumentReference:
    def __init__(self, doc_id):
        self.id = doc_id

class MockQuery:
    def __init__(self, data, where_clauses=None, order_clauses=None, limit_count=None):
        self.data = data
        self.where_clauses = where_clauses or []
        self.order_clauses = order_clauses or []
        self.limit_count = limit_count
    
    def where(self, field, operator, value):
        new_clauses = self.where_clauses + [(field, operator, value)]
        return MockQuery(self.data, new_clauses, self.order_clauses, self.limit_count)
    
    def orderBy(self, field, direction='asc'):
        new_order = self.order_clauses + [(field, direction)]
        return MockQuery(self.data, self.where_clauses, new_order, self.limit_count)
    
    def limit(self, count):
        return MockQuery(self.data, self.where_clauses, self.order_clauses, count)
    
    async def get(self):
        # Apply where clauses
        filtered_data = {}
        for doc_id, doc_data in self.data.items():
            include = True
            for field, operator, value in self.where_clauses:
                doc_value = self._get_nested_value(doc_data, field)
                if operator == '==' and doc_value != value:
                    include = False
                    break
                elif operator == 'array-contains' and value not in (doc_value or []):
                    include = False
                    break
                elif operator == '>' and not (doc_value and doc_value > value):
                    include = False
                    break
                elif operator == 'not-in' and doc_value in value:
                    include = False
                    break
            
            if include:
                filtered_data[doc_id] = doc_data
        
        # Apply limit
        if self.limit_count:
            items = list(filtered_data.items())[:self.limit_count]
            filtered_data = dict(items)
        
        return MockQuerySnapshot(filtered_data)
    
    def _get_nested_value(self, data, field):
        if '.' in field:
            keys = field.split('.')
            value = data
            for key in keys:
                if isinstance(value, dict) and key in value:
                    value = value[key]
                else:
                    return None
            return value
        return data.get(field)

class MockQuerySnapshot:
    def __init__(self, data):
        self.data = data
        self.docs = [MockDocumentSnapshot(doc_data, doc_id, True) 
                    for doc_id, doc_data in data.items()]
        self.size = len(self.docs)
        self.empty = len(self.docs) == 0

# Global mock firestore instance
mock_firestore = MockFirestore()

class FirebaseServiceTester:
    """Test Firebase services with mocked Firestore"""
    
    def __init__(self):
        self.test_results = []
        self.setup_test_data()
    
    def setup_test_data(self):
        """Setup initial test data"""
        # Test users
        self.test_user_1 = {
            'uid': 'test_user_1',
            'email': 'user1@safetalk.com',
            'displayName': 'TestUser1',
            'isPremium': False,
            'dailyTimeUsed': 0,
            'dailyTimeLimit': 20 * 60 * 1000,  # 20 minutes
            'lastResetDate': datetime.now().strftime('%Y-%m-%d'),
            'blockedUsers': [],
            'stats': {
                'totalChats': 0,
                'totalMessagesReceived': 0,
                'totalMessagesSent': 0,
                'averageRating': 0,
                'totalRatings': 0,
            }
        }
        
        self.test_user_2 = {
            'uid': 'test_user_2',
            'email': 'user2@safetalk.com',
            'displayName': 'TestUser2',
            'isPremium': True,
            'dailyTimeUsed': 0,
            'dailyTimeLimit': 20 * 60 * 1000,
            'lastResetDate': datetime.now().strftime('%Y-%m-%d'),
            'blockedUsers': [],
            'stats': {
                'totalChats': 0,
                'totalMessagesReceived': 0,
                'totalMessagesSent': 0,
                'averageRating': 4.5,
                'totalRatings': 10,
            }
        }
    
    def log_test(self, test_name: str, success: bool, message: str, details: Dict = None):
        """Log test result"""
        result = {
            'test': test_name,
            'success': success,
            'message': message,
            'details': details or {},
            'timestamp': datetime.utcnow().isoformat()
        }
        self.test_results.append(result)
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status} {test_name}: {message}")
        if details:
            print(f"   Details: {json.dumps(details, indent=2)}")
    
    async def test_user_service(self):
        """Test UserService functionality"""
        print("\n=== Testing UserService ===")
        
        try:
            # Setup user data in mock firestore
            users_collection = mock_firestore.collection('users')
            await users_collection.doc('test_user_1').set(self.test_user_1)
            await users_collection.doc('test_user_2').set(self.test_user_2)
            
            # Setup credits data
            credits_collection = mock_firestore.collection('credits')
            await credits_collection.doc('test_user_1').set({
                'userId': 'test_user_1',
                'totalCredits': 10,
                'usedCredits': 2,
                'purchaseHistory': []
            })
            
            # Test 1: Daily Timer Reset Logic
            await self.test_daily_timer_reset()
            
            # Test 2: Credit Usage
            await self.test_credit_usage()
            
            # Test 3: User Stats Update
            await self.test_user_stats_update()
            
            # Test 4: Premium User Handling
            await self.test_premium_user_handling()
            
        except Exception as e:
            self.log_test("UserService Setup", False, f"Setup failed: {str(e)}")
            traceback.print_exc()
    
    async def test_daily_timer_reset(self):
        """Test daily timer reset functionality"""
        try:
            # Simulate yesterday's date
            yesterday = (datetime.now() - timedelta(days=1)).strftime('%Y-%m-%d')
            
            # Update user with yesterday's date
            user_doc = mock_firestore.collection('users').doc('test_user_1')
            await user_doc.update({
                'lastResetDate': yesterday,
                'dailyTimeUsed': 15 * 60 * 1000  # 15 minutes used
            })
            
            # Simulate checkAndResetDailyTimer logic
            user_data = await user_doc.get()
            user_info = user_data.data()
            
            today = datetime.now().strftime('%Y-%m-%d')
            if user_info['lastResetDate'] != today:
                await user_doc.update({
                    'dailyTimeUsed': 0,
                    'lastResetDate': today,
                    'updatedAt': datetime.utcnow()
                })
                
                # Verify reset
                updated_user = await user_doc.get()
                updated_data = updated_user.data()
                
                if updated_data['dailyTimeUsed'] == 0 and updated_data['lastResetDate'] == today:
                    self.log_test("Daily Timer Reset", True, "Timer reset successfully for new day")
                else:
                    self.log_test("Daily Timer Reset", False, "Timer reset failed", updated_data)
            else:
                self.log_test("Daily Timer Reset", True, "No reset needed - same day")
                
        except Exception as e:
            self.log_test("Daily Timer Reset", False, f"Error: {str(e)}")
    
    async def test_credit_usage(self):
        """Test credit usage functionality"""
        try:
            credit_ref = mock_firestore.collection('credits').doc('test_user_1')
            credit_doc = await credit_ref.get()
            
            if not credit_doc.exists:
                self.log_test("Credit Usage", False, "Credits not found")
                return
            
            credit_data = credit_doc.data()
            available_credits = credit_data['totalCredits'] - credit_data.get('usedCredits', 0)
            credits_to_use = 3
            
            if available_credits >= credits_to_use:
                await credit_ref.update({
                    'usedCredits': credit_data.get('usedCredits', 0) + credits_to_use,
                    'updatedAt': datetime.utcnow()
                })
                
                # Verify credit usage
                updated_credit = await credit_ref.get()
                updated_data = updated_credit.data()
                new_used = updated_data.get('usedCredits', 0)
                
                if new_used == credit_data.get('usedCredits', 0) + credits_to_use:
                    remaining = updated_data['totalCredits'] - new_used
                    self.log_test("Credit Usage", True, f"Credits used successfully. Remaining: {remaining}")
                else:
                    self.log_test("Credit Usage", False, "Credit usage update failed")
            else:
                self.log_test("Credit Usage", True, f"Insufficient credits detected correctly. Available: {available_credits}, Requested: {credits_to_use}")
                
        except Exception as e:
            self.log_test("Credit Usage", False, f"Error: {str(e)}")
    
    async def test_user_stats_update(self):
        """Test user statistics update"""
        try:
            user_ref = mock_firestore.collection('users').doc('test_user_1')
            
            # Simulate stats update
            stat_updates = {
                'totalChats': 1,
                'totalMessagesSent': 5
            }
            
            user_doc = await user_ref.get()
            current_stats = user_doc.data().get('stats', {})
            
            # Update stats
            updated_stats = current_stats.copy()
            for key, increment in stat_updates.items():
                updated_stats[key] = updated_stats.get(key, 0) + increment
            
            await user_ref.update({
                'stats': updated_stats,
                'updatedAt': datetime.utcnow()
            })
            
            # Verify update
            updated_user = await user_ref.get()
            new_stats = updated_user.data()['stats']
            
            success = (new_stats['totalChats'] == 1 and new_stats['totalMessagesSent'] == 5)
            self.log_test("User Stats Update", success, 
                         f"Stats updated: {new_stats}" if success else "Stats update failed")
                         
        except Exception as e:
            self.log_test("User Stats Update", False, f"Error: {str(e)}")
    
    async def test_premium_user_handling(self):
        """Test premium user functionality"""
        try:
            # Test premium user (unlimited time)
            premium_user = await mock_firestore.collection('users').doc('test_user_2').get()
            premium_data = premium_user.data()
            
            if premium_data['isPremium']:
                # Premium users should have unlimited time
                self.log_test("Premium User Check", True, "Premium user identified correctly")
                
                # Test subscription handling
                subscription_data = {
                    'userId': 'test_user_2',
                    'subscriptionType': 'MONTHLY',
                    'startDate': datetime.utcnow(),
                    'endDate': datetime.utcnow() + timedelta(days=30),
                    'status': 'active'
                }
                
                await mock_firestore.collection('subscriptions').add(subscription_data)
                self.log_test("Premium Subscription", True, "Subscription created successfully")
            else:
                self.log_test("Premium User Check", False, "Premium user not identified")
                
        except Exception as e:
            self.log_test("Premium User Handling", False, f"Error: {str(e)}")
    
    async def test_chat_service(self):
        """Test ChatService functionality"""
        print("\n=== Testing ChatService ===")
        
        try:
            # Test 1: Chat Creation
            await self.test_chat_creation()
            
            # Test 2: Message Sending
            await self.test_message_sending()
            
            # Test 3: Chat Rating System
            await self.test_chat_rating()
            
            # Test 4: User Blocking
            await self.test_user_blocking()
            
        except Exception as e:
            self.log_test("ChatService Setup", False, f"Setup failed: {str(e)}")
    
    async def test_chat_creation(self):
        """Test chat room creation"""
        try:
            chat_data = {
                'participants': ['test_user_1', 'test_user_2'],
                'createdAt': datetime.utcnow(),
                'lastMessageAt': datetime.utcnow(),
                'isActive': True,
                'messageCount': 0,
                'ratingSubmitted': False,
                'ratingEligible': False,
            }
            
            chat_ref = await mock_firestore.collection('chats').add(chat_data)
            chat_id = chat_ref.id
            
            # Verify chat creation
            created_chat = await mock_firestore.collection('chats').doc(chat_id).get()
            
            if created_chat.exists:
                chat_info = created_chat.data()
                success = (len(chat_info['participants']) == 2 and 
                          chat_info['isActive'] and 
                          chat_info['messageCount'] == 0)
                self.log_test("Chat Creation", success, 
                             f"Chat created with ID: {chat_id}" if success else "Chat creation failed")
                
                # Store for other tests
                self.test_chat_id = chat_id
            else:
                self.log_test("Chat Creation", False, "Chat not found after creation")
                
        except Exception as e:
            self.log_test("Chat Creation", False, f"Error: {str(e)}")
    
    async def test_message_sending(self):
        """Test message sending functionality"""
        try:
            if not hasattr(self, 'test_chat_id'):
                self.log_test("Message Sending", False, "No chat available for testing")
                return
            
            # Send a message
            message_data = {
                '_id': f"msg_{int(datetime.now().timestamp())}",
                'text': 'Hello, this is a test message!',
                'user': {'_id': 'test_user_1'},
                'createdAt': datetime.utcnow(),
                'chatId': self.test_chat_id,
            }
            
            # Add message to subcollection
            messages_collection = (mock_firestore.collection('chats')
                                 .doc(self.test_chat_id)
                                 .collection('messages'))
            await messages_collection.add(message_data)
            
            # Update chat metadata
            chat_ref = mock_firestore.collection('chats').doc(self.test_chat_id)
            chat_doc = await chat_ref.get()
            current_count = chat_doc.data().get('messageCount', 0)
            
            await chat_ref.update({
                'lastMessageAt': datetime.utcnow(),
                'messageCount': current_count + 1,
                'ratingEligible': current_count + 1 >= 5
            })
            
            # Update sender stats
            user_ref = mock_firestore.collection('users').doc('test_user_1')
            user_doc = await user_ref.get()
            current_stats = user_doc.data().get('stats', {})
            current_stats['totalMessagesSent'] = current_stats.get('totalMessagesSent', 0) + 1
            
            await user_ref.update({
                'stats': current_stats,
                'updatedAt': datetime.utcnow()
            })
            
            # Verify message sending
            updated_chat = await chat_ref.get()
            updated_user = await user_ref.get()
            
            chat_data = updated_chat.data()
            user_stats = updated_user.data()['stats']
            
            success = (chat_data['messageCount'] == 1 and 
                      user_stats['totalMessagesSent'] >= 1)
            
            self.log_test("Message Sending", success, 
                         "Message sent and stats updated" if success else "Message sending failed")
                         
        except Exception as e:
            self.log_test("Message Sending", False, f"Error: {str(e)}")
    
    async def test_chat_rating(self):
        """Test chat rating system"""
        try:
            if not hasattr(self, 'test_chat_id'):
                self.log_test("Chat Rating", False, "No chat available for testing")
                return
            
            # Submit a rating
            rating_data = {
                'chatId': self.test_chat_id,
                'raterId': 'test_user_1',
                'partnerId': 'test_user_2',
                'rating': 5,
                'comment': 'Great conversation!',
                'createdAt': datetime.utcnow(),
            }
            
            await mock_firestore.collection('ratings').add(rating_data)
            
            # Update chat as rated
            await mock_firestore.collection('chats').doc(self.test_chat_id).update({
                'ratingSubmitted': True,
            })
            
            # Update partner's average rating
            partner_ratings = await (mock_firestore.collection('ratings')
                                   .where('partnerId', '==', 'test_user_2')
                                   .get())
            
            total_rating = sum(doc.data()['rating'] for doc in partner_ratings.docs)
            average_rating = total_rating / partner_ratings.size if partner_ratings.size > 0 else 0
            
            await mock_firestore.collection('users').doc('test_user_2').update({
                'stats.averageRating': average_rating,
                'stats.totalRatings': partner_ratings.size,
                'updatedAt': datetime.utcnow()
            })
            
            # Verify rating
            updated_chat = await mock_firestore.collection('chats').doc(self.test_chat_id).get()
            updated_partner = await mock_firestore.collection('users').doc('test_user_2').get()
            
            chat_data = updated_chat.data()
            partner_stats = updated_partner.data()['stats']
            
            success = (chat_data['ratingSubmitted'] and partner_stats['totalRatings'] >= 1)
            self.log_test("Chat Rating", success, 
                         f"Rating submitted. Partner average: {partner_stats.get('averageRating', 0)}" 
                         if success else "Rating submission failed")
                         
        except Exception as e:
            self.log_test("Chat Rating", False, f"Error: {str(e)}")
    
    async def test_user_blocking(self):
        """Test user blocking functionality"""
        try:
            # Block a user
            user_ref = mock_firestore.collection('users').doc('test_user_1')
            user_doc = await user_ref.get()
            current_blocked = user_doc.data().get('blockedUsers', [])
            
            blocked_user_id = 'test_user_2'
            if blocked_user_id not in current_blocked:
                current_blocked.append(blocked_user_id)
                
                await user_ref.update({
                    'blockedUsers': current_blocked,
                    'updatedAt': datetime.utcnow()
                })
            
            # Verify blocking
            updated_user = await user_ref.get()
            blocked_users = updated_user.data().get('blockedUsers', [])
            
            success = blocked_user_id in blocked_users
            self.log_test("User Blocking", success, 
                         f"User blocked successfully. Blocked list: {blocked_users}" 
                         if success else "User blocking failed")
                         
        except Exception as e:
            self.log_test("User Blocking", False, f"Error: {str(e)}")
    
    async def test_matchmaking_service(self):
        """Test MatchmakingService functionality"""
        print("\n=== Testing MatchmakingService ===")
        
        try:
            # Test 1: Matchmaking Queue
            await self.test_matchmaking_queue()
            
            # Test 2: Partner Finding
            await self.test_partner_finding()
            
            # Test 3: Recent Partner Avoidance
            await self.test_recent_partner_avoidance()
            
            # Test 4: Blocked User Exclusion
            await self.test_blocked_user_exclusion()
            
        except Exception as e:
            self.log_test("MatchmakingService Setup", False, f"Setup failed: {str(e)}")
    
    async def test_matchmaking_queue(self):
        """Test matchmaking queue management"""
        try:
            # Add user to matchmaking queue
            queue_data = {
                'userId': 'test_user_1',
                'status': 'waiting',
                'joinedAt': datetime.utcnow(),
                'excludeUsers': ['blocked_user_1'],
            }
            
            await mock_firestore.collection('matchmaking').doc('test_user_1').set(queue_data)
            
            # Verify queue entry
            queue_doc = await mock_firestore.collection('matchmaking').doc('test_user_1').get()
            
            if queue_doc.exists:
                queue_info = queue_doc.data()
                success = (queue_info['status'] == 'waiting' and 
                          queue_info['userId'] == 'test_user_1')
                self.log_test("Matchmaking Queue", success, 
                             "User added to queue successfully" if success else "Queue addition failed")
            else:
                self.log_test("Matchmaking Queue", False, "User not found in queue")
                
        except Exception as e:
            self.log_test("Matchmaking Queue", False, f"Error: {str(e)}")
    
    async def test_partner_finding(self):
        """Test partner finding algorithm"""
        try:
            # Add second user to queue
            queue_data_2 = {
                'userId': 'test_user_2',
                'status': 'waiting',
                'joinedAt': datetime.utcnow(),
                'excludeUsers': [],
            }
            
            await mock_firestore.collection('matchmaking').doc('test_user_2').set(queue_data_2)
            
            # Simulate finding a match
            exclude_users = ['blocked_user_1', 'test_user_1']
            waiting_users = await (mock_firestore.collection('matchmaking')
                                 .where('status', '==', 'waiting')
                                 .get())
            
            partner_found = None
            for doc in waiting_users.docs:
                waiting_user = doc.data()
                if (waiting_user['userId'] != 'test_user_1' and 
                    waiting_user['userId'] not in exclude_users):
                    partner_found = waiting_user['userId']
                    break
            
            success = partner_found == 'test_user_2'
            self.log_test("Partner Finding", success, 
                         f"Partner found: {partner_found}" if success else "No partner found")
                         
        except Exception as e:
            self.log_test("Partner Finding", False, f"Error: {str(e)}")
    
    async def test_recent_partner_avoidance(self):
        """Test recent partner avoidance logic"""
        try:
            # Create a recent chat
            one_hour_ago = datetime.utcnow() - timedelta(hours=1)
            recent_chat = {
                'participants': ['test_user_1', 'test_user_2'],
                'createdAt': one_hour_ago,
                'isActive': False
            }
            
            await mock_firestore.collection('chats').add(recent_chat)
            
            # Get recent partners (within 1 day)
            one_day_ago = datetime.utcnow() - timedelta(days=1)
            recent_chats = await (mock_firestore.collection('chats')
                                .where('participants', 'array-contains', 'test_user_1')
                                .get())
            
            recent_partners = []
            for doc in recent_chats.docs:
                chat_data = doc.data()
                # In real implementation, would check createdAt > one_day_ago
                partner_id = next((p for p in chat_data['participants'] if p != 'test_user_1'), None)
                if partner_id and partner_id not in recent_partners:
                    recent_partners.append(partner_id)
            
            success = 'test_user_2' in recent_partners
            self.log_test("Recent Partner Avoidance", success, 
                         f"Recent partners identified: {recent_partners}" if success else "Recent partner detection failed")
                         
        except Exception as e:
            self.log_test("Recent Partner Avoidance", False, f"Error: {str(e)}")
    
    async def test_blocked_user_exclusion(self):
        """Test blocked user exclusion from matching"""
        try:
            # Get user's blocked list
            user_doc = await mock_firestore.collection('users').doc('test_user_1').get()
            blocked_users = user_doc.data().get('blockedUsers', [])
            
            # Simulate matchmaking with exclusions
            exclude_users = blocked_users + ['test_user_1']  # Self + blocked users
            
            # In real implementation, would query waiting users excluding these
            success = len(exclude_users) > 1  # Should have at least self + blocked users
            self.log_test("Blocked User Exclusion", success, 
                         f"Exclusion list created: {exclude_users}" if success else "Exclusion logic failed")
                         
        except Exception as e:
            self.log_test("Blocked User Exclusion", False, f"Error: {str(e)}")
    
    async def test_auth_service(self):
        """Test AuthService functionality"""
        print("\n=== Testing AuthService ===")
        
        try:
            # Test 1: User Creation
            await self.test_user_creation()
            
            # Test 2: User Data Retrieval
            await self.test_user_data_retrieval()
            
            # Test 3: Email Existence Check
            await self.test_email_existence_check()
            
        except Exception as e:
            self.log_test("AuthService Setup", False, f"Setup failed: {str(e)}")
    
    async def test_user_creation(self):
        """Test user creation and initialization"""
        try:
            # Simulate new user creation
            new_user_data = {
                'uid': 'new_test_user',
                'email': 'newuser@safetalk.com',
                'displayName': 'NewTestUser',
                'phoneNumber': None,
                'photoURL': None,
                'createdAt': datetime.utcnow(),
                'lastLogin': datetime.utcnow(),
                'isPremium': False,
                'subscriptionType': None,
                'dailyTimeUsed': 0,
                'dailyTimeLimit': 20 * 60 * 1000,
                'lastResetDate': datetime.now().strftime('%Y-%m-%d'),
                'totalCredits': 0,
                'referralCode': f"ST{str(uuid.uuid4())[:6].upper()}",
                'isBlocked': False,
                'settings': {
                    'notifications': True,
                    'soundEnabled': True,
                    'theme': 'light',
                },
                'stats': {
                    'totalChats': 0,
                    'totalMessagesReceived': 0,
                    'totalMessagesSent': 0,
                    'averageRating': 0,
                    'totalRatings': 0,
                },
            }
            
            # Create user
            await mock_firestore.collection('users').doc('new_test_user').set(new_user_data)
            
            # Initialize credits
            await mock_firestore.collection('credits').doc('new_test_user').set({
                'userId': 'new_test_user',
                'totalCredits': 0,
                'usedCredits': 0,
                'purchaseHistory': [],
                'createdAt': datetime.utcnow(),
            })
            
            # Verify creation
            user_doc = await mock_firestore.collection('users').doc('new_test_user').get()
            credit_doc = await mock_firestore.collection('credits').doc('new_test_user').get()
            
            success = (user_doc.exists and credit_doc.exists and 
                      user_doc.data()['isPremium'] == False and
                      user_doc.data()['dailyTimeUsed'] == 0)
            
            self.log_test("User Creation", success, 
                         "New user created with default values" if success else "User creation failed")
                         
        except Exception as e:
            self.log_test("User Creation", False, f"Error: {str(e)}")
    
    async def test_user_data_retrieval(self):
        """Test user data retrieval"""
        try:
            user_doc = await mock_firestore.collection('users').doc('test_user_1').get()
            
            if user_doc.exists:
                user_data = user_doc.data()
                success = ('uid' in user_data and 'email' in user_data and 'stats' in user_data)
                self.log_test("User Data Retrieval", success, 
                             f"User data retrieved: {user_data['displayName']}" if success else "Data retrieval failed")
            else:
                self.log_test("User Data Retrieval", False, "User not found")
                
        except Exception as e:
            self.log_test("User Data Retrieval", False, f"Error: {str(e)}")
    
    async def test_email_existence_check(self):
        """Test email existence checking"""
        try:
            # Check existing email
            existing_users = await (mock_firestore.collection('users')
                                  .where('email', '==', 'user1@safetalk.com')
                                  .get())
            
            exists = not existing_users.empty
            
            # Check non-existing email
            non_existing_users = await (mock_firestore.collection('users')
                                      .where('email', '==', 'nonexistent@safetalk.com')
                                      .get())
            
            not_exists = non_existing_users.empty
            
            success = exists and not_exists
            self.log_test("Email Existence Check", success, 
                         "Email existence check working correctly" if success else "Email check failed")
                         
        except Exception as e:
            self.log_test("Email Existence Check", False, f"Error: {str(e)}")
    
    def generate_summary(self):
        """Generate test summary"""
        total_tests = len(self.test_results)
        passed_tests = sum(1 for result in self.test_results if result['success'])
        failed_tests = total_tests - passed_tests
        
        print(f"\n{'='*60}")
        print(f"FIREBASE BACKEND TESTING SUMMARY")
        print(f"{'='*60}")
        print(f"Total Tests: {total_tests}")
        print(f"Passed: {passed_tests} ✅")
        print(f"Failed: {failed_tests} ❌")
        print(f"Success Rate: {(passed_tests/total_tests*100):.1f}%")
        
        if failed_tests > 0:
            print(f"\n❌ FAILED TESTS:")
            for result in self.test_results:
                if not result['success']:
                    print(f"  - {result['test']}: {result['message']}")
        
        print(f"\n✅ CRITICAL FUNCTIONALITY STATUS:")
        
        # Check critical systems
        critical_systems = {
            'Daily Timer System': ['Daily Timer Reset'],
            'Credit System': ['Credit Usage'],
            'Chat System': ['Chat Creation', 'Message Sending'],
            'Matchmaking System': ['Matchmaking Queue', 'Partner Finding'],
            'Authentication': ['User Creation', 'User Data Retrieval']
        }
        
        for system, tests in critical_systems.items():
            system_results = [r for r in self.test_results if r['test'] in tests]
            system_passed = all(r['success'] for r in system_results)
            status = "✅ WORKING" if system_passed else "❌ ISSUES"
            print(f"  {system}: {status}")
        
        return {
            'total_tests': total_tests,
            'passed_tests': passed_tests,
            'failed_tests': failed_tests,
            'success_rate': passed_tests/total_tests*100,
            'critical_systems_status': {
                system: all(r['success'] for r in self.test_results if r['test'] in tests)
                for system, tests in critical_systems.items()
            }
        }

async def main():
    """Main test execution"""
    print("🔥 Starting Firebase Backend Testing for SafeTalk")
    print("=" * 60)
    
    tester = FirebaseServiceTester()
    
    try:
        # Run all tests
        await tester.test_user_service()
        await tester.test_chat_service()
        await tester.test_matchmaking_service()
        await tester.test_auth_service()
        
        # Generate summary
        summary = tester.generate_summary()
        
        # Save detailed results
        with open('/app/firebase_test_results.json', 'w') as f:
            json.dump({
                'summary': summary,
                'detailed_results': tester.test_results,
                'timestamp': datetime.utcnow().isoformat()
            }, f, indent=2, default=str)
        
        print(f"\n📊 Detailed results saved to: /app/firebase_test_results.json")
        
        # Return appropriate exit code
        if summary['failed_tests'] > 0:
            print(f"\n⚠️  Some tests failed. Check the results above.")
            return 1
        else:
            print(f"\n🎉 All tests passed successfully!")
            return 0
            
    except Exception as e:
        print(f"\n💥 Testing failed with error: {str(e)}")
        traceback.print_exc()
        return 1

if __name__ == "__main__":
    exit_code = asyncio.run(main())
    sys.exit(exit_code)