import 'dart:io';
import 'dart:typed_data';
import 'package:flutter/foundation.dart';
import 'package:image/image.dart' as img;

class ImageCompressor {
  /// Resize image on-device to max 1024px on the long edge, JPEG quality ~80, EXIF stripped in an isolate.
  static Future<Uint8List> compressImageInIsolate(Uint8List inputBytes) async {
    return compute(_processImage, inputBytes);
  }

  static Uint8List _processImage(Uint8List rawBytes) {
    // Decode image (image package automatically strips EXIF metadata on re-encoding)
    final decoded = img.decodeImage(rawBytes);
    if (decoded == null) {
      throw Exception('Failed to decode image bytes.');
    }

    int width = decoded.width;
    int height = decoded.height;
    const int maxLongEdge = 1024;

    img.Image resized = decoded;
    if (width > maxLongEdge || height > maxLongEdge) {
      if (width >= height) {
        resized = img.copyResize(decoded, width: maxLongEdge);
      } else {
        resized = img.copyResize(decoded, height: maxLongEdge);
      }
    }

    // Encode to JPEG quality 80 with EXIF metadata stripped
    final compressedBytes = img.encodeJpg(resized, quality: 80);
    return Uint8List.fromList(compressedBytes);
  }
}
