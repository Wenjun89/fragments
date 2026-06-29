const { randomUUID } = require('crypto');
const contentType = require('content-type');

const {
  readFragment,
  writeFragment,
  readFragmentData,
  writeFragmentData,
  listFragments,
  deleteFragment,
} = require('./data');

class Fragment {
  constructor({ id, ownerId, created, updated, type, size = 0 }) {
    if (!ownerId) throw new Error('ownerId is required');
    if (!type) throw new Error('type is required');
    if (!Fragment.isSupportedType(type)) {
      throw new Error(`Unsupported type: ${type}`);
    }
    if (typeof size !== 'number' || size < 0) {
      throw new Error('size must be a non-negative number');
    }

    this.id = id || randomUUID();
    this.ownerId = ownerId;
    this.created = created || new Date().toISOString();
    this.updated = updated || new Date().toISOString();
    this.type = type;
    this.size = size;
  }

  /**
   * Retrieves all fragments for the given user.
   * @param {string} ownerId - The hashed email of the user.
   * @param {boolean} expand - If true, returns full fragment objects.
   * @returns {Promise<Array<string|Fragment>>}
   */
  static async byUser(ownerId, expand = false) {
    const results = await listFragments(ownerId, expand);
    return expand && results 
      ? results.map((data) => new Fragment(data)) 
      : results || [];
  }

  /**
   * Retrieves a specific fragment by ID.
   * @param {string} ownerId - The hashed email of the user.
   * @param {string} id - The fragment ID.
   * @returns {Promise<Fragment>}
   */
  static async byId(ownerId, id) {
    const fragmentData = await readFragment(ownerId, id);
    if (!fragmentData) throw new Error(`Fragment not found: ${id}`);
    return new Fragment(fragmentData);
  }

  static delete(ownerId, id) {
    return deleteFragment(ownerId, id);
  }

  save() {
    this.updated = new Date().toISOString();
    return writeFragment(this);
  }

  getData() {
    return readFragmentData(this.ownerId, this.id);
  }

  async setData(data) {
    if (!Buffer.isBuffer(data)) {
      throw new Error('data must be a Node.js Buffer');
    }
    this.size = data.length;
    this.updated = new Date().toISOString();
    
    await writeFragment(this);
    return writeFragmentData(this.ownerId, this.id, data);
  }

  get mimeType() {
    const { type } = contentType.parse(this.type);
    return type;
  }

  get isText() {
    return this.mimeType.startsWith('text/');
  }

  get formats() {
    return [this.mimeType];
  }

  /**
   * Validates if the provided content type is supported.
   * @param {string} value - The Content-Type string.
   * @returns {boolean}
   */
  static isSupportedType(value) {
    if (!value) return false;
    try {
      const { type } = contentType.parse(value);
      const supportedTypes = [
        'text/plain',
        'text/html',
        'text/markdown',
        'application/json',
      ];
      return supportedTypes.includes(type.toLowerCase());
    } catch (err) {
      return false;
    }
  }
}

module.exports.Fragment = Fragment;