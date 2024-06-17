import Logger from 'debug';
import config from 'src/config';

const { appName: name } = config;

const Factory = {
  getLogger: (moduleName: string) => {
    return {
      logError: Logger(`${name}:error:${moduleName}`),
      logDebug: Logger(`${name}:${moduleName}`),
    };
  },
};

export = Factory;
