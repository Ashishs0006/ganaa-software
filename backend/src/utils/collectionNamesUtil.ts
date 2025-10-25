/**
 * Utility class for converting model names to MongoDB collection names.
 */
class CollectionUtils {
  private static readonly rules: [RegExp, string][] = [
    [/human$/gi, 'humans'],
    [/(m)an$/gi, '$1en'],
    [/(pe)rson$/gi, '$1ople'],
    [/(child)$/gi, '$1ren'],
    [/^(ox)$/gi, '$1en'],
    [/(ax|test)is$/gi, '$1es'],
    [/(octop|vir)us$/gi, '$1i'],
    [/(alias|status)$/gi, '$1es'],
    [/(bu)s$/gi, '$1ses'],
    [/(buffal|tomat|potat)o$/gi, '$1oes'],
    [/([ti])um$/gi, '$1a'],
    [/sis$/gi, 'ses'],
    [/(?:([^f])fe|([lr])f)$/gi, '$1$2ves'],
    [/(hive)$/gi, '$1s'],
    [/([^aeiouy]|qu)y$/gi, '$1ies'],
    [/(x|ch|ss|sh)$/gi, '$1es'],
    [/(matr|vert|ind)ix|ex$/gi, '$1ices'],
    [/([m|l])ouse$/gi, '$1ice'],
    [/(kn|w|l)ife$/gi, '$1ives'],
    [/(quiz)$/gi, '$1zes'],
    [/^goose$/i, 'geese'],
    [/s$/gi, 's'],
    [/([^a-z])$/, '$1'],
    [/$/gi, 's'],
  ];

  private static readonly uncountables: string[] = [
    'advice',
    'energy',
    'excretion',
    'digestion',
    'cooperation',
    'health',
    'justice',
    'labour',
    'machinery',
    'equipment',
    'information',
    'pollution',
    'sewage',
    'paper',
    'money',
    'species',
    'series',
    'rain',
    'rice',
    'fish',
    'sheep',
    'moose',
    'deer',
    'news',
    'expertise',
    'status',
    'media',
  ];

  /**
   * Converts a collection name like "DD_ReferredType" to "dd_referredtypes"
   */
  public static toMongoCollectionName(modelName: string): string {
    const plural = this.pluralize(modelName);
    return plural;
  }

  private static pluralize(word: string): string {
    let found;
    word = word.toLowerCase();
    if (!~this.uncountables.indexOf(word)) {
      found = this.rules.filter(function (rule) {
        return word.match(rule[0]);
      });
      if (found[0]) {
        return word.replace(found[0][0], found[0][1]);
      }
    }
    return word;
  }
}

/**
 * Represents a model with its MongoDB collection name.
 */
class CollectionInfo {
  public d: string; // D = Collection or Database Collection Names

  constructor(public name: string) {
    this.d = CollectionUtils.toMongoCollectionName(name);
  }
}

export default CollectionInfo;
