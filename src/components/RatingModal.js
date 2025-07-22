import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
  ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useChat } from '../context/ChatContext';
import { COLORS } from '../utils/helpers';

const RatingModal = ({ visible, onClose, onSubmit }) => {
  const { ratePartner } = useChat();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmitRating = async () => {
    if (rating === 0) {
      Alert.alert('Rating Required', 'Please select a rating before submitting.');
      return;
    }

    setSubmitting(true);
    
    try {
      const result = await ratePartner(rating, comment);
      
      if (result.success) {
        Alert.alert(
          'Thank You!',
          'Your rating has been submitted and helps improve our community.',
          [{ text: 'OK', onPress: () => {
            onSubmit();
            resetForm();
          }}]
        );
      } else {
        Alert.alert('Error', 'Failed to submit rating');
      }
    } catch (error) {
      Alert.alert('Error', 'An unexpected error occurred');
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setRating(0);
    setComment('');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const renderStars = () => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <TouchableOpacity
          key={i}
          style={styles.starButton}
          onPress={() => setRating(i)}
          disabled={submitting}
        >
          <Icon
            name={i <= rating ? 'star' : 'star-border'}
            size={40}
            color={i <= rating ? COLORS.warning : COLORS.border}
          />
        </TouchableOpacity>
      );
    }
    return stars;
  };

  const getRatingText = () => {
    switch (rating) {
      case 1: return 'Very Poor';
      case 2: return 'Poor';
      case 3: return 'Average';
      case 4: return 'Good';
      case 5: return 'Excellent';
      default: return 'Select a rating';
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.title}>Rate Your Experience</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={handleClose}
                disabled={submitting}
              >
                <Icon name="close" size={24} color={COLORS.textSecondary} />
              </TouchableOpacity>
            </View>

            {/* Subtitle */}
            <Text style={styles.subtitle}>
              How was your conversation? Your feedback helps improve our community.
            </Text>

            {/* Star Rating */}
            <View style={styles.ratingContainer}>
              <Text style={styles.ratingLabel}>Tap to rate</Text>
              <View style={styles.starsContainer}>
                {renderStars()}
              </View>
              <Text style={styles.ratingText}>{getRatingText()}</Text>
            </View>

            {/* Comment */}
            <View style={styles.commentContainer}>
              <Text style={styles.commentLabel}>
                Additional feedback (optional)
              </Text>
              <TextInput
                style={styles.commentInput}
                value={comment}
                onChangeText={setComment}
                placeholder="Share more about your experience..."
                placeholderTextColor={COLORS.placeholder}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
                maxLength={500}
                editable={!submitting}
              />
              <Text style={styles.characterCount}>
                {comment.length}/500
              </Text>
            </View>

            {/* Quick Feedback Buttons */}
            {rating > 0 && (
              <View style={styles.quickFeedbackContainer}>
                <Text style={styles.quickFeedbackLabel}>Quick feedback:</Text>
                <View style={styles.quickButtons}>
                  <TouchableOpacity
                    style={styles.quickButton}
                    onPress={() => setComment(prev => prev + (prev ? ', ' : '') + 'Friendly conversation')}
                    disabled={submitting}
                  >
                    <Text style={styles.quickButtonText}>😊 Friendly</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.quickButton}
                    onPress={() => setComment(prev => prev + (prev ? ', ' : '') + 'Interesting topics')}
                    disabled={submitting}
                  >
                    <Text style={styles.quickButtonText}>🎯 Interesting</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.quickButton}
                    onPress={() => setComment(prev => prev + (prev ? ', ' : '') + 'Respectful interaction')}
                    disabled={submitting}
                  >
                    <Text style={styles.quickButtonText}>🤝 Respectful</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* Submit Button */}
            <TouchableOpacity
              style={[
                styles.submitButton,
                (rating === 0 || submitting) && styles.submitButtonDisabled,
              ]}
              onPress={handleSubmitRating}
              disabled={rating === 0 || submitting}
            >
              <Text style={styles.submitButtonText}>
                {submitting ? 'Submitting...' : 'Submit Rating'}
              </Text>
            </TouchableOpacity>

            {/* Skip Option */}
            <TouchableOpacity
              style={styles.skipButton}
              onPress={handleClose}
              disabled={submitting}
            >
              <Text style={styles.skipButtonText}>Skip for now</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    width: '90%',
    maxWidth: 400,
    maxHeight: '80%',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },
  content: {
    padding: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  closeButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 22,
  },
  ratingContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  ratingLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.text,
    marginBottom: 16,
  },
  starsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 12,
  },
  starButton: {
    padding: 4,
    marginHorizontal: 4,
  },
  ratingText: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.primary,
  },
  commentContainer: {
    marginBottom: 24,
  },
  commentLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.text,
    marginBottom: 12,
  },
  commentInput: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: COLORS.text,
    backgroundColor: '#FFFFFF',
    minHeight: 100,
  },
  characterCount: {
    fontSize: 12,
    color: COLORS.textSecondary,
    textAlign: 'right',
    marginTop: 4,
  },
  quickFeedbackContainer: {
    marginBottom: 24,
  },
  quickFeedbackLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.text,
    marginBottom: 12,
  },
  quickButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  quickButton: {
    backgroundColor: COLORS.background,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    marginHorizontal: 4,
    marginVertical: 4,
  },
  quickButtonText: {
    fontSize: 12,
    color: COLORS.text,
    fontWeight: '500',
  },
  submitButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  submitButtonDisabled: {
    backgroundColor: COLORS.border,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  skipButton: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  skipButtonText: {
    color: COLORS.textSecondary,
    fontSize: 16,
    fontWeight: '500',
  },
});

export default RatingModal;