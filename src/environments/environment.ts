export const environment = {
    production: false,
    managerDashboardMode: false,
    region: 'il',//controls logic (BL, currency sign etc). supported: 'il'/'us'
    tbtLocale: 'he-IL',//controls localization (directions, translations, formattings, plurals etc.) supported: 'he-IL'/'en-US'
    lang: 'he',
    rosConfig: {
        il: 'https://ros-rp-beta.tabit.cloud/',
        us: 'https://us-ros-rp.tabit.cloud/'
    },
    remoteDatabases: {
        il: 'https://analytics-dev.tabit.cloud/handler/chef.ashx',
        us: 'https://analytics-us.tabit.cloud/chef/handler.ashx'
    },
    olapConfig: {
        baseUrl: 'https://analytics-dev.tabit.cloud/proxyV2/il-prod/proxy.ashx',
        sqlServerProxy: 'https://analytics-dev.tabit.cloud/olapproxy/handler.ashx',
        catalog: 'isrProd',
        cube: 'tlogs',
    },
    translationBaseUrl: './assets/i18n/'
};
