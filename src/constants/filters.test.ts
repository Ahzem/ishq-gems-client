import { createFilterRegex, matchesAnyFilter, fixedFilterOptions } from './filters';

// Test the createFilterRegex function
describe('createFilterRegex', () => {
  it('should create case-insensitive regex', () => {
    const regex = createFilterRegex('Ruby');
    expect(regex.test('ruby')).toBe(true);
    expect(regex.test('RUBY')).toBe(true);
    expect(regex.test('Ruby')).toBe(true);
    expect(regex.test('Sapphire')).toBe(false);
  });

  it('should escape special regex characters', () => {
    const regex = createFilterRegex('Test(+)');
    expect(regex.test('Test(+)')).toBe(true);
    expect(regex.test('Test+')).toBe(false);
  });

  it('should match substrings', () => {
    const regex = createFilterRegex('Ruby');
    expect(regex.test('Natural Ruby')).toBe(true);
    expect(regex.test('Ruby Star')).toBe(true);
    expect(regex.test('Star Ruby Effect')).toBe(true);
    expect(regex.test('Blue Sapphire')).toBe(false);
  });
});

// Test the matchesAnyFilter function
describe('matchesAnyFilter', () => {
  it('should return true when no filters are selected', () => {
    expect(matchesAnyFilter('Ruby', [])).toBe(true);
    expect(matchesAnyFilter('Sapphire', [])).toBe(true);
  });

  it('should return true when gem field is undefined', () => {
    expect(matchesAnyFilter(undefined, ['Ruby', 'Sapphire'])).toBe(true);
  });

  it('should match case-insensitive substrings', () => {
    expect(matchesAnyFilter('Natural Ruby', ['Ruby'])).toBe(true);
    expect(matchesAnyFilter('BLUE SAPPHIRE', ['Sapphire'])).toBe(true);
    expect(matchesAnyFilter('Star Ruby Effect', ['Ruby'])).toBe(true);
  });

  it('should match any of the selected filters', () => {
    expect(matchesAnyFilter('Ruby', ['Ruby', 'Sapphire'])).toBe(true);
    expect(matchesAnyFilter('Sapphire', ['Ruby', 'Sapphire'])).toBe(true);
    expect(matchesAnyFilter('Emerald', ['Ruby', 'Sapphire'])).toBe(false);
  });

  it('should work with complex gem descriptions', () => {
    const filters = ['Ruby', 'Sapphire'];
    expect(matchesAnyFilter('Natural Unheated Burmese Ruby', filters)).toBe(true);
    expect(matchesAnyFilter('Ceylon Blue Sapphire', filters)).toBe(true);
    expect(matchesAnyFilter('Colombian Emerald', filters)).toBe(false);
  });
});

// Test the fixed filter options
describe('fixedFilterOptions', () => {
  it('should contain expected gem types', () => {
    expect(fixedFilterOptions.gemTypes).toContain('Ruby');
    expect(fixedFilterOptions.gemTypes).toContain('Sapphire');
    expect(fixedFilterOptions.gemTypes).toContain('Emerald');
    expect(fixedFilterOptions.gemTypes).toContain('Diamond');
  });

  it('should contain expected colors', () => {
    expect(fixedFilterOptions.colors).toContain('Red');
    expect(fixedFilterOptions.colors).toContain('Blue');
    expect(fixedFilterOptions.colors).toContain('Green');
    expect(fixedFilterOptions.colors).toContain('Yellow');
  });

  it('should contain expected shapes', () => {
    expect(fixedFilterOptions.shapes).toContain('Round');
    expect(fixedFilterOptions.shapes).toContain('Oval');
    expect(fixedFilterOptions.shapes).toContain('Cushion');
  });

  it('should contain expected origins', () => {
    expect(fixedFilterOptions.origins).toContain('Burma (Myanmar)');
    expect(fixedFilterOptions.origins).toContain('Sri Lanka');
    expect(fixedFilterOptions.origins).toContain('Thailand');
  });

  it('should have price and carat ranges', () => {
    expect(fixedFilterOptions.priceRange).toHaveProperty('min');
    expect(fixedFilterOptions.priceRange).toHaveProperty('max');
    expect(fixedFilterOptions.caratRange).toHaveProperty('min');
    expect(fixedFilterOptions.caratRange).toHaveProperty('max');
  });
}); 