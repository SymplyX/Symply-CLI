const { setTimeout: setAsyncTimeout } = require('timers/promises');
const p = require('@clack/prompts');
const figlet = require('figlet');
const gradient = require('gradient-string');
const i18n = require('i18n');
const {access, existsSync} = require("fs");
const color = require('picocolors');
const axios = require('axios');

i18n.configure({
    locales: ['en', 'fr', 'es'],
    directory: __dirname + '/lang',
    defaultLocale: 'en',
    objectNotation: true,
});

i18n.init();

let fileinstall = process.cwd();

const getPreReleases = async () => {
    try {
        const owner = 'SymplyX';
        const repo = 'Symply';

        const response = await axios.get(`https://api.github.com/repos/${owner}/${repo}/releases`);
        const releases = response.data;
        const hasPrerelease = releases.some(release => release.prerelease);

        return hasPrerelease;
    } catch (error) {
        console.error('Error fetching releases from GitHub:', error);
        return [];
    }
};

const getReleases = async () => {
    try {
        const owner = 'SymplyX';
        const repo = 'Symply';

        const response = await axios.get(`https://api.github.com/repos/${owner}/${repo}/releases`);
        const releases = response.data;

        return releases;
    } catch (error) {
        console.error('Error fetching releases from GitHub:', error);
        return [];
    }
};

const chooseRelease = async (releases, isLatest) => {
    try {
        if (isLatest) {
            console.log('Downloading the latest release...');
        } else {
            const latestFiveReleases = releases.slice(0, 5);
            console.log('Please choose from the following releases:');
            console.log(latestFiveReleases);
        }
    } catch (error) {
        console.error('Error:', error);
    }
};

async function main() {

    await figlet('Symply', function (err, data) {
        console.log(gradient.pastel.multiline(data));
    });

    await p.intro("Welcome to Symply's automatic installer. This program will ask you questions and, depending on the answers, you'll get an installation that's just right for you.")
    try {
        const lang = await p.select({
            message: 'Select a language:',
            options: [
                {value: 'en', label: 'English', hint: 'default'},
                {value: 'fr', label: 'French'},
                {value: 'es', label: 'Spanish'},
            ],
            initialValue: 'en',
        });
        i18n.setLocale(lang);
    } catch (error) {
        console.error('Error:', error);
    }
    try {
        const confirms = await p.confirm({
            message: i18n.__('good_file'),
            active: i18n.__('yes') + " (" + fileinstall + ")",
            inactive: i18n.__('no_sure_go_change'),
            initialValue: false
        });
        if (!confirms) {
            let newPath;
            let isValidPath = false;

            do {
                newPath = await p.text({
                    message: i18n.__('new_path'),
                    initialValue: fileinstall,
                    validate: (value) => {
                        if (!value) {
                            return i18n.__('undefined_path');
                        }
                        if (!existsSync(value)) {
                            return i18n.__('invalid_path');
                        }
                        fileinstall = value;
                        isValidPath = true;
                    },
                });
            } while (!isValidPath);
        }
    } catch (error) {
        console.error('Error:', error);
    }


    const HasPrerelease = await getPreReleases();

    if (HasPrerelease) {
        try {
            const confirms = await p.confirm({
                message: i18n.__('build-version'),
                active: i18n.__('yes'),
                inactive: i18n.__('no'),
                initialValue: false
            });
            if (confirms) {
                const spin = p.spinner();
                spin.start(color.green('Installing Symply in development mode'));
                await setAsyncTimeout(3000);
                spin.stop();
            }
        } catch (error) {
            console.error('Error:', error);
        }
    }

    try {
        const releases = await getReleases();
            const isLatest = await p.confirm({
                message: i18n.__('latest_version'),
                active: i18n.__('yes'),
                inactive: i18n.__('no'),
                initialValue: true
            });

            if (isLatest) {
                // Traiter ici la dernière version
                // Placeholder pour le traitement de la dernière version
            } else {
                const latestFiveReleases = releases.slice(0, 5).map(release => ({
                    value: release.tag_name,
                    label: release.tag_name,
                }));

                const chooseVersion = await p.select({
                    message: 'Select a Symply version:',
                    options: latestFiveReleases,
                    initialValue: latestFiveReleases.length > 0 ? latestFiveReleases[0] : null,
                });

                if (chooseVersion) {
                    const selectedRelease = releases.find(release => release.tag_name === chooseVersion.value);
                    // Télécharger la version sélectionnée depuis GitHub
                    // Utiliser `selectedRelease` pour accéder aux données spécifiques à cette version
                }
            }
    } catch (error) {
        console.error('Error:', error);
    }
}

main().then(r => r);