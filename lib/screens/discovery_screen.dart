import 'package:flutter/material.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

class DiscoveryScreen extends StatefulWidget {
  const DiscoveryScreen({super.key});

  @override
  State<DiscoveryScreen> createState() => _DiscoveryScreenState();
}

class _DiscoveryScreenState extends State<DiscoveryScreen> {
  final SupabaseClient _supabase = Supabase.instance.client;
  bool _isLoading = true;
  List<Map<String, dynamic>> _profiles = [];
  String? _error;

  @override
  void initState() {
    super.initState();
    _loadDiscoveryProfiles();
  }

  Future<void> _loadDiscoveryProfiles() async {
    setState(() {
      _isLoading = true;
      _error = null;
    });

    try {
      // Calls Postgres RPC `discover_profiles` which enforces opposite-gender discovery
      final response = await _supabase.rpc('discover_profiles');

      setState(() {
        _profiles = List<Map<String, dynamic>>.from(response ?? []);
        _isLoading = false;
      });
    } catch (e) {
      setState(() {
        _error = "Unable to load discovery profiles: $e";
        _isLoading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Discover Matches')),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : _error != null
              ? Center(child: Text(_error!))
              : _profiles.isEmpty
                  ? const Center(child: Text('No new opposite-gender profiles available.'))
                  : ListView.builder(
                      itemCount: _profiles.length,
                      itemBuilder: (context, index) {
                        final profile = _profiles[index];
                        return ListTile(
                          title: Text(profile['name'] ?? 'Candidate'),
                          subtitle: Text("${profile['gender']} • ${profile['age']} yrs • ${profile['city'] ?? ''}"),
                        );
                      },
                    ),
    );
  }
}
