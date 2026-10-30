import 'package:flutter/foundation.dart';

/// Sealed class representing all typed failure cases in the selfie verification flow.
sealed class SelfieVerificationFailure {
  const SelfieVerificationFailure();

  /// Map failure case to a short, friendly, actionable message for the UI.
  String get userMessage => switch (this) {
    CameraPermissionDenied() =>
      "Camera permission is required. Please grant access in your device settings to verify your profile.",
    CameraUnavailable() =>
      "Unable to access your camera. Please check if another app is using it and try again.",
    NoFaceDetected() =>
      "We couldn't see your face. Hold the phone at eye level in good light and try again.",
    MultipleFaces() =>
      "Multiple faces were detected. Please make sure only you are in the camera frame.",
    PoorLighting() =>
      "The lighting is too dim or uneven. Move to a well-lit area and try again.",
    FaceNotMatchingProfilePhoto() =>
      "Your selfie doesn't match your profile photo closely enough. Ensure your face is clear and unobstructed.",
    UploadFailed() =>
      "Failed to upload your photo. Please check your network connection and try again.",
    NetworkOffline() =>
      "No internet connection. Check your connection and retry.",
    ServiceTimeout() =>
      "Verification took too long. Please retry with a stable internet connection.",
    ServiceError(:final message) =>
      message.isNotEmpty ? message : "Verification service encountered an error. Please try again shortly.",
    UnknownFailure() =>
      "An unexpected error occurred. Please try again.",
  };

  /// Whether this failure case requires or provides an "Open Settings" button action.
  bool get hasOpenSettingsAction => this is CameraPermissionDenied;
}

class CameraPermissionDenied extends SelfieVerificationFailure {
  const CameraPermissionDenied();
}

class CameraUnavailable extends SelfieVerificationFailure {
  const CameraUnavailable();
}

class NoFaceDetected extends SelfieVerificationFailure {
  const NoFaceDetected();
}

class MultipleFaces extends SelfieVerificationFailure {
  const MultipleFaces();
}

class PoorLighting extends SelfieVerificationFailure {
  const PoorLighting();
}

class FaceNotMatchingProfilePhoto extends SelfieVerificationFailure {
  const FaceNotMatchingProfilePhoto();
}

class UploadFailed extends SelfieVerificationFailure {
  final String? originalError;
  const UploadFailed([this.originalError]);
}

class NetworkOffline extends SelfieVerificationFailure {
  const NetworkOffline();
}

class ServiceTimeout extends SelfieVerificationFailure {
  const ServiceTimeout();
}

class ServiceError extends SelfieVerificationFailure {
  final String message;
  const ServiceError(this.message);
}

class UnknownFailure extends SelfieVerificationFailure {
  final String? rawException;
  const UnknownFailure([this.rawException]);
}
