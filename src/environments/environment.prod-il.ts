export const environment = {
    production: true,
    region: 'il',
    tbtLocale: 'he-IL',//
    rosConfig: {//IL 'BETA' 'REPORTS'
        baseUrl: 'https://ros-office-beta.herokuapp.com/'
    },
    olapConfig: {//IL PROD CUBE
        baseUrl: 'https://analytics-dev.tabit.cloud/olapproxy/proxy.ashx',
        sqlServerProxy: 'https://analytics-dev.tabit.cloud/olapproxy/handler.ashx',
        catalog: 'isrProd',
        cube: 'tlogs',
    }
};
