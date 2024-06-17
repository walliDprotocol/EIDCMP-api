import { DB } from 'src/database';
import { DataBaseSchemas } from 'src/types/enums';

const { logDebug } = require('src/core-services/logFunctionFactory').getLogger('service:infractions');

export async function getListInfractions() {
  const infractions = await DB.find(DataBaseSchemas.INFRACTIONS, {}, {}, {});
  return infractions;
}

export async function addInfraction(userInfractionsId: string, infractionId: string) {
  const infraction = await DB.findOne(DataBaseSchemas.INFRACTIONS, { _id: infractionId }, {}, {});

  if (!infraction) {
    throw new Error('Infraction not found');
  }

  logDebug('Infraction found', infraction);

  // update the infraction active to true and applied date
  infraction.active = true;
  infraction.appliedOn = Date.now();

  const userInfractionList = { $push: { infractions: infraction } };

  // Should infrations be unique?
  // const userInfractionList = [{
  //   $set: {
  //     infractions: {
  //       $cond: {
  //         if: { $in: [infraction._id, '$infractions._id'] },
  //         then: '$infractions',
  //         else: { $concatArrays: ['$infractions', [infraction]] },
  //       },
  //     },
  //   },
  // }];

  const userInfraction = await DB.findOneAndUpdate(DataBaseSchemas.USER_INFRACTIONS, { _id: userInfractionsId }, userInfractionList, { returnDocument: 'after' });
  return userInfraction;
}
