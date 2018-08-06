export const environment = {
    production: true,
    region: 'il',
    tbtLocale: 'he-IL',//
    rosConfig: {//IL 'BETA' 'REPORTS'
        // baseUrl: 'https://inpact-int.herokuapp.com/',
        baseUrl: 'https://il-int-ros.tabit-stage.com/'//BETA
        // baseUrl: 'https://ros-report-prd.herokuapp.com/'//PROD
    },
    olapConfig: {//IL PROD CUBE
        baseUrl: 'https://analytics-dev.tabit.cloud/proxyV2/il-int/proxy.ashx',
        sqlServerProxy: 'https://analytics-dev.tabit.cloud/olapproxy/handler.ashx',
        catalog: 'isrProd',
        cube: 'tlogs',
    }
};