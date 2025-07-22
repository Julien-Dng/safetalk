import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  TextInput,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";

interface RatingPopupProps {
  isOpen: boolean;
  onClose: () => void;
  interlocutorName: string;
  onSubmitRating: (rating: number, comment: string) => void;
}

export function RatingPopup({ isOpen, onClose, interlocutorName, onSubmitRating }: RatingPopupProps) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");

  const handleSubmit = () => {
    onSubmitRating(rating, comment);
    setRating(0);
    setComment("");
  };

  return (
    <Modal
      visible={isOpen}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <BlurView style={styles.backdrop} intensity={20} tint="dark">
        <View style={styles.modalContainer}>
          <LinearGradient
            colors={['#1a1a2e', '#16213e']}
            style={styles.modal}
          >
            <Text style={styles.title}>Rate your conversation</Text>
            <Text style={styles.subtitle}>with {interlocutorName}</Text>
            
            <View style={styles.ratingSection}>
              <Text style={styles.ratingTitle}>How was it?</Text>
              <View style={styles.stars}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <TouchableOpacity
                    key={star}
                    onPress={() => setRating(star)}
                    style={styles.star}
                  >
                    <Text style={[
                      styles.starText,
                      star <= rating && styles.starSelected
                    ]}>
                      ⭐
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.commentSection}>
              <Text style={styles.commentTitle}>Optional feedback:</Text>
              <TextInput
                style={styles.commentInput}
                value={comment}
                onChangeText={setComment}
                placeholder="Share your thoughts..."
                placeholderTextColor="#7c3aed"
                multiline
                maxLength={200}
              />
            </View>

            <View style={styles.buttons}>
              <TouchableOpacity
                style={[styles.submitButton, !rating && styles.submitButtonDisabled]}
                onPress={handleSubmit}
                disabled={!rating}
              >
                <Text style={styles.submitButtonText}>Submit</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.skipButton} onPress={onClose}>
                <Text style={styles.skipButtonText}>Skip</Text>
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </View>
      </BlurView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    margin: 20,
    borderRadius: 20,
    overflow: 'hidden',
  },
  modal: {
    padding: 24,
    alignItems: 'center',
    minWidth: 320,
  },
  title: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  subtitle: {
    color: '#c4b5fd',
    fontSize: 14,
    marginBottom: 24,
  },
  ratingSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  ratingTitle: {
    color: '#ffffff',
    fontSize: 16,
    marginBottom: 12,
  },
  stars: {
    flexDirection: 'row',
    gap: 8,
  },
  star: {
    padding: 4,
  },
  starText: {
    fontSize: 24,
    opacity: 0.3,
  },
  starSelected: {
    opacity: 1,
  },
  commentSection: {
    width: '100%',
    marginBottom: 24,
  },
  commentTitle: {
    color: '#c4b5fd',
    fontSize: 14,
    marginBottom: 8,
  },
  commentInput: {
    backgroundColor: 'rgba(124, 58, 237, 0.2)',
    borderRadius: 12,
    padding: 12,
    color: '#ffffff',
    fontSize: 14,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  buttons: {
    flexDirection: 'row',
    gap: 12,
  },
  submitButton: {
    backgroundColor: '#7c3aed',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  skipButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  skipButtonText: {
    color: '#c4b5fd',
    fontSize: 14,
  },
});