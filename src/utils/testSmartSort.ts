/**
 * Smart Sort Test for Variant Options
 * Tests the sorting logic implemented in productdetails.tsx
 */

// Smart sorting function (same as in productdetails.tsx)
const smartSort = (items: string[]): string[] => {
  return [...items].sort((a, b) => {
    // Extract leading numbers
    const aMatch = a.match(/^(\d+)/);
    const bMatch = b.match(/^(\d+)/);
    
    // Both have leading numbers - sort numerically
    if (aMatch && bMatch) {
      const aNum = parseInt(aMatch[1]);
      const bNum = parseInt(bMatch[1]);
      if (aNum !== bNum) return aNum - bNum;
      // If numbers are equal, sort by remaining text
      return a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' });
    }
    
    // Only a has leading number - it comes first
    if (aMatch) return -1;
    
    // Only b has leading number - it comes first
    if (bMatch) return 1;
    
    // Neither has leading number - alphanumeric sort (handles "Seater 1" vs "Seater 2")
    return a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' });
  });
};

// Test cases
console.log('Testing Smart Sort for Variant Options\n' + '='.repeat(50));

// Test 1: Sizes with numbers first (like "1 Seater", "2 Seater", "3 Seater")
const sizes = ['3 Seater', '1 Seater', '2 Seater'];
console.log('\nTest 1 - Sizes with leading numbers:');
console.log('Input:', sizes);
console.log('Sorted:', smartSort(sizes));
console.log('Expected: [1 Seater, 2 Seater, 3 Seater]');

// Test 2: Purely alphabetical (like colors)
const colors = ['Turquoise', 'Beige', 'Black', 'Brown', 'Camel', 'Cream', 'Green', 'Grey', 
                'Mustard Yellow', 'Navy Blue', 'Off-White (Cream)', 'Pink', 
                'Purple', 'Red Wine', 'Rose Pink', 'Saddle'];
console.log('\nTest 2 - Colors (alphabetical):');
console.log('Input:', colors.slice(0, 5), '...');
console.log('Sorted:', smartSort(colors).slice(0, 5), '...');
console.log('Full sorted list:', smartSort(colors));

// Test 3: Patterns (alphabetical)
const patterns = ['Velvet', 'Boucle'];
console.log('\nTest 3 - Patterns (alphabetical):');
console.log('Input:', patterns);
console.log('Sorted:', smartSort(patterns));
console.log('Expected: [Boucle, Velvet]');

// Test 4: Qualities (alphabetical)
const qualities = ['Standard', 'Premium'];
console.log('\nTest 4 - Qualities (alphabetical):');
console.log('Input:', qualities);
console.log('Sorted:', smartSort(qualities));
console.log('Expected: [Premium, Standard]');

// Test 5: Mixed format with "Seater 1", "Seater 2" (alphabetic then number)
const mixedSizes = ['Seater 3', 'Seater 1', 'Seater 2'];
console.log('\nTest 5 - Mixed format (alphabetic then number):');
console.log('Input:', mixedSizes);
console.log('Sorted:', smartSort(mixedSizes));
console.log('Expected: [Seater 1, Seater 2, Seater 3]');

// Test 6: Complex mix of all types
const mixed = ['3 Seater', 'Beige', '1 Seater', 'Velvet', '2 Seater', 'Premium'];
console.log('\nTest 6 - Complex mix:');
console.log('Input:', mixed);
console.log('Sorted:', smartSort(mixed));
console.log('Expected: [1 Seater, 2 Seater, 3 Seater, Beige, Premium, Velvet]');

console.log('\n' + '='.repeat(50));
console.log('All tests completed!');
