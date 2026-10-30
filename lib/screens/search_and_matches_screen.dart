import 'package:flutter/material.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

class SearchAndMatchesScreen extends StatefulWidget {
  const SearchAndMatchesScreen({super.key});

  @override
  State<SearchAndMatchesScreen> createState() => _SearchAndMatchesScreenState();
}

class _SearchAndMatchesScreenState extends State<SearchAndMatchesScreen> {
  final SupabaseClient _supabase = Supabase.instance.client;
  bool _isLoading = false;
  List<Map<String, dynamic>> _searchResults = [];

  Future<void> _searchProfiles(String query) async {
    setState(() => _isLoading = true);

    try {
      // Execute query through RPC discover_profiles or filtered view which enforces opposite gender RLS
      final response = await _supabase
          .rpc('discover_profiles')
          .ilike('name', '%$query%');

      setState(() {
        _searchResults = List<Map<String, dynamic>>.from(response ?? []);
        _isLoading = false;
      });
    } catch (e) {
      setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Search & Matches')),
      body: Column(
        children: [
          Padding(
            padding: const EdgeInsets.all(12.0),
            child: fieldTextField(onSubmitted: _searchProfiles),
          ),
          Expanded(
            child: _isLoading
                ? const Center(child: CircularProgressIndicator())
                : ListView.builder(
                    itemCount: _searchResults.length,
                    itemBuilder: (context, index) {
                      final item = _searchResults[index];
                      return ListTile(
                        title: Text(item['name'] ?? ''),
                        subtitle: Text("${item['gender']} • ${item['city'] ?? ''}"),
                      );
                    },
                  ),
          ),
        ],
      ),
    );
  }

  Widget fieldTextField({required ValueChanged<String> onSubmitted}) {
    return TextField(
      decoration: const InputDecoration(
        labelText: 'Search opposite-gender profiles...',
        border: OutlineInputBorder(),
      ),
      onSubmitted: onSubmitted,
    );
  }
}
