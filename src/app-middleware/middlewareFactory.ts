import { Config } from 'src/config';

const middlewareFactoryList = require('./middlewareFactoryList');

export = function middlewareFactory(config: Config) {
  return middlewareFactoryList.map((factory:any) => {
    return factory(config);
  });
};
