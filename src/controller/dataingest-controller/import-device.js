require('dotenv').config();
const config = require('../../config');

const moment = require("moment");
const axios = require("axios");
const FormData = require("form-data");
const Firestore = require("@google-cloud/firestore");
const { BigQuery } = require("@google-cloud/bigquery");

const db = require("../../lib/firestore");
const bigquery = require("../../lib/bigquery");

const devices = [
  {'deviceId': '0010',  'name': 'I-2001-01001-1773-1', 'location': 'Dr Mui’s office ' },
  {'deviceId': '0011',  'name': 'I-2001-01002-1775-1', 'location': 'CSO office ' },
  {'deviceId': '0012',  'name': 'I-2001-01003-1777-1', 'location': 'Private office of BSE dept' },
  {'deviceId': '0013',  'name': 'I-2001-01004-1779-1', 'location': 'CSO office ' },
  {'deviceId': '0014',  'name': 'I-2001-01005-177B-1', 'location': 'BSE general office, Block Z' },
  {'deviceId': '0015',  'name': 'I-2001-01006-177D-1', 'location': 'Dr Mui’s office' },
  {'deviceId': '0016',  'name': 'I-2001-01007-177F-1', 'location': 'Open plan office of Academic Registry ' },
  {'deviceId': '0017',  'name': 'I-2001-01008-1781-1', 'location': 'default location ' },
  {'deviceId': '0018',  'name': 'I-2001-01009-1783-1', 'location': 'Dr Wong’s office ' },
  {'deviceId': '0019',  'name': 'I-2001-01010-1785-1', 'location': 'zs824 ' },
  {'deviceId': '0020',  'name': 'I-2001-01011-1787-1', 'location': 'zs824' },
  {'deviceId': '0021',  'name': 'I-2001-01012-1789-1', 'location': 'zs824 ' },
  {'deviceId': '0022',  'name': 'I-2001-01013-178B-1', 'location': 'Joseph’s office ' },
  {'deviceId': '0023',  'name': 'I-2001-01014-178D-1', 'location': 'Joseph’s office ' },
  {'deviceId': '0024',  'name': 'I-2001-01015-178F-1', 'location': 'Dr Wong’s office ' },
  {'deviceId': '0025',  'name': 'E-2001-01031-1F7F-1', 'location': 'Dr Mui’s office ' },
  {'deviceId': '0026',  'name': 'E-2001-01032-1F81-1', 'location': 'Dr Wong’s office ' },
  {'deviceId': '0027',  'name': 'E-2001-01033-1F83-1', 'location': 'default location' },
  {'deviceId': '0028',  'name': 'E-2001-01034-1F85-1', 'location': 'zs824' },
  {'deviceId': '0029',  'name': 'E-2001-01035-1F87-1', 'location': 'Default location ' },
  {'deviceId': '0033',  'name': 'I-2001-01016-1791-1', 'location': 'zs824' },
  {'deviceId': '0034',  'name': 'I-2001-01017-1793-1', 'location': 'zs824' },
  {'deviceId': '0035',  'name': 'I-2001-01018-1795-1', 'location': 'zs824' },
  {'deviceId': '0036',  'name': 'I-2001-01019-1797-1', 'location': 'zs824' },
  {'deviceId': '0037',  'name': 'I-2001-01020-1799-1', 'location': 'zs824' },
  {'deviceId': '0038',  'name': 'I-2001-01021-179B-1', 'location': 'zs824' },
  {'deviceId': '0039',  'name': 'I-2001-01022-179D-1', 'location': 'zs824' },
  {'deviceId': '0040',  'name': 'I-2001-01023-179F-1', 'location': 'zs824' },
  {'deviceId': '0041',  'name': 'I-2001-01024-17A1-1', 'location': 'zs824' },
  {'deviceId': '0042',  'name': 'I-2001-01025-17A3-1', 'location': 'zs824' },
  {'deviceId': '0043',  'name': 'I-2001-01026-17A5-1', 'location': 'zs824' },
  {'deviceId': '0044',  'name': 'I-2001-01027-17A7-1', 'location': 'zs824' },
  {'deviceId': '0045',  'name': 'I-2001-01028-17A9-1', 'location': 'zs824' },
  {'deviceId': '0046',  'name': 'I-2001-01029-17AB-1', 'location': 'zs824' },
  {'deviceId': '0047',  'name': 'I-2001-01030-17AD-1', 'location': 'zs824' },
  {'deviceId': '0048',  'name': 'I-2004-01001-1776-1', 'location': 'Default loacation' },
  {'deviceId': '0049',  'name': 'I-2004-01002-1778-1', 'location': 'Default loacation' },
  {'deviceId': '0050',  'name': 'I-2004-01003-177A-1', 'location': 'Default loacation' },
  {'deviceId': '0060',  'name': 'E-2001-01036-1F89-1', 'location': 'Default loacation' },
  {'deviceId': '0061',  'name': 'E-2001-01037-1F8B-1', 'location': 'Default loacation' },
  {'deviceId': '0062',  'name': 'E-2001-01038-1F8D-1', 'location': 'Default loacation' },
  {'deviceId': '0063',  'name': 'E-2001-01039-1F8F-1', 'location': 'Default loacation' },
  {'deviceId': '0064',  'name': 'E-2001-01040-1F91-1', 'location': 'Default loacation' },
  {'deviceId': '0065',  'name': 'E-2001-01041-1F93-1', 'location': 'Default loacation' },
  {'deviceId': '9998',  'name': 'TESTING-DEVICE', 'location': 'Default loacation' }
]

const importDevice = async ctx => {
  for(let i=0; i<devices.length; i++){
    let device = devices[i];
    console.log(device);
    let deviceData = {
      deviceId: device.deviceId,
      location: device.location,
      name: device.name,
      continueOn: 0,
      instantOn: 0,
      offTime: 4,
      onTime: 10,
      lastIngestionTime: null,
      owner: db.doc('users/3ElM1txP9E3hgV6yRzjW'),
      realtimeMode: 0,
      updateTime: Firestore.Timestamp.now(),
      warmUpEnd: null,  
      warmUpStart: null
    }

    let response = await db.collection("devices").add(deviceData);
    console.log(response.id);
  }
}

importDevice();
