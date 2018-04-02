export const environment = {
    production: false,
    region: 'us',
    tbtLocale: 'en-US',
    rosConfig: {//US 'PROD' 'REPORTS'
        baseUrl: 'https://us-ros-rp.tabit.cloud/'
    },
    olapConfig: {//US PROD CUBE
        baseUrl: 'https://analytics-us.tabit.cloud/olapproxy/proxy.ashx',
        catalog: 'usaProd',
        cube: 'tlogs',
    }
};
