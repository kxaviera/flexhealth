import 'package:flutter_test/flutter_test.dart';
import 'package:flex_health/main.dart';

void main() {
  testWidgets('App boots splash', (tester) async {
    await tester.pumpWidget(const FlexHealthApp());
    expect(find.textContaining('Health'), findsWidgets);
  });
}
