const parse = require('parse');
import config from '../config';
export class ParseHelper {
  constructor() {
    this._initilized = false;
  }

  get client() {
    return parse;
  }

  instance() {
    return parse;
  }

  getClass(className) {
    return parse.Object.extend(className);
  }

  getUserClass() {
    return parse.User;
  }

  getAccountQuery() {
    return this.getQuery('Account');
  }

  getTargetQuery() {
    return this.getQuery('Target');
  }

  getContractQuery() {
    return this.getQuery('Contract');
  }

  getHistoryQuery() {
    return this.getQuery('History');
  }

  getQuery(className) {
    return new parse.Query(className);
  }

  destroy() {
    return Promise.all([
    ]);
  }

  init(isRefresh) {
    if (!this._initilized || isRefresh) {
      parse.initialize(config.PARSE_APP_ID, config.PARSE_JS_KEY);
      parse.masterKey = config.PARSE_MASTER_KEY;
      parse.serverURL = config.PARSE_URL;
    }

    this.destroy().then(() => {
      this._initilized = true;
    })
  }

  getLiveQueryClient() {
    return new parse.LiveQueryClient({
      applicationId: config.PARSE_APP_ID,
      serverURL: config.PARSE_LIVE_QUERY_URL,
      javascriptKey: config.PARSE_JS_KEY
    });
  }
  
  callCloud(func, params) {
    return parse.Cloud.run(func, params)
  }

  getHistories(contract, skip = 0, limit = 100) {
    const query = this.getHistoryQuery();
    query.equalTo('contract', contract);
    query.descending("createdAt");
    query.skip(skip);
    query.limit(limit);
    return query.find();
  }
}

const instance = new ParseHelper();
// instance.init();
export default instance;
