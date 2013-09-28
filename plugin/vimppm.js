let INFO = xml`
    <plugin name="vimppm" version="0.0.1"
            href="https://github.com/cd01/vimppm"
            summary="Vimperator Plugin Manager"
            lang="ja"
            xmlns="http://vimperator.org/namespaces/liberator">
        <author>CD01</author>
        <license>New BSD License</license>
        <project name="Vimperator" minVersion="3.0"/>
        <p>
            Vimppm
        </p>

        <item>
            <tags>:vimppm</tags>
            <spec>:vimppm</spec>
            <description>
                <p>
                    vimppm で管理する
                </p>
            </description>
        </item>

        <item>
            <tags>:vimppm install</tags>
            <spec>:vimppm install</spec>
            <description>
                <p>
                    install
                </p>
            </description>
        </item>

        <item>
            <tags>:vimppm update</tags>
            <spec>:vimppm update</spec>
            <description>
                <p>
                    update
                </p>
            </description>
        </item>
    </plugin>`;


var vimppmDirPath = getVimppmDir();

function getVimppmDir() {
    var vimperatorDir = io.File(io.File.expandPath("~/.vimperator"));

    if (vimperatorDir.exists()) return "~/.vimperator/vimppm";

    var vimperatorDir = io.File(io.File.expandPath("~/_vimperator"));

    if (underscoreVimperatorDir.exists())
        return "~/_vimperator/vimppm";
    else
        return false;
}

function isGithubRepository(repositoryName) {
    return (repositoryName.indexOf('/') !== -1) ? true : false;
}

function isDirectory(path) {
    var pluginDir = io.File(io.File.expandPath(path));
    return (pluginDir.exists() && pluginDir.isDirectory()) ? true : false;
}

function installFromGithub(vimppmRepositoryName) {
    var pluginDirPath = vimppmDirPath + '/' + vimppmRepositoryName.split('/')[1];
    if (!isDirectory(pluginDirPath)) {
        if (liberator.has('Windows')) {
            liberator.execute('!powershell -NoProfile -ExecutionPolicy unrestricted -Command cd "' + vimppmDirPath + '"; git clone git://github.com/' + vimppmRepositoryName + '.git');
        } else {
            liberator.execute('!cd ' + vimppmDirPath + ' && git clone git://github.com/' + vimppmRepositoryName + '.git');
        }
        return true;
    } else {
        liberator.echoerr(vimppmRepositoryName + 'is already exists!');
        return false;
    }
}

function gitPull(vimppmRepositoryName) {
    var pluginDirPath = vimppmDirPath + '/' + vimppmRepositoryName.split('/')[1];
    if (isDirectory(pluginDirPath)) {
        if (liberator.has('Windows')) {
            liberator.execute('!powershell -NoProfile -ExecutionPolicy unrestricted -Command cd "' + pluginDirPath + '"; git pull');
        } else {
            liberator.execute('!cd ' + pluginDirPath + ' && git pull');
        }
        return true;
    } else {
        liberator.echoerr(vimppmRepositoryName + "isn't installed");
        return false;
    }
}

function installFromVimpr(pluginName) {
    var pluginDirPath = vimppmDirPath + '/' + pluginName;
    if (!isDirectory(pluginDirPath)) {
        if (liberator.has('Windows')) {
            var downloadUrl = 'https://raw.github.com/vimpr/vimperator-plugins/master/' + pluginName;
            var destPath = io.File.expandPath(pluginDirPath + '/plugin/' + pluginName)
            liberator.execute('!powershell -NoProfile -ExecutionPolicy unrestricted -Command New-Item -type directory "' + io.File.expandPath(pluginDirPath) + '/plugin"');
            liberator.execute('!powershell -NoProfile -ExecutionPolicy unrestricted -Command $(new-object System.Net.WebClient).DownloadFile("' + downloadUrl + '", "' + destPath + '")');
        } else {
            liberator.execute('!mkdir -p ' + io.File.expandPath(pluginDirPath) + '/plugin');
            liberator.execute('!wget https://raw.github.com/vimpr/vimperator-plugins/master/' + pluginName + ' -P ' + io.File.expandPath(pluginDirPath) + '/plugin/');
        }
        return true;
    } else {
        liberator.echoerr(pluginName + 'is already exists!');
        return false;
    }
}

function updateFromVimpr(pluginName) {
    var pluginDirPath = vimppmDirPath + '/' + pluginName;
    if (isDirectory(pluginDirPath)) {
        if (liberator.has('Windows')) {
            var downloadUrl = 'https://raw.github.com/vimpr/vimperator-plugins/master/' + pluginName;
            var destPath = io.File.expandPath(pluginDirPath + '/plugin/' + pluginName)
            liberator.execute('!powershell -NoProfile -ExecutionPolicy unrestricted -Command $(new-object System.Net.WebClient).DownloadFile("' + downloadUrl + '", "' + destPath + '")');
        } else {
            liberator.execute('!wget https://raw.github.com/vimpr/vimperator-plugins/master/' + pluginName + ' -O ' + io.File.expandPath(pluginDirPath) + '/plugin/' + pluginName);
        }
        return true;
    } else {
        liberator.echoerr(pluginName + "isn't installed");
        return false;
    }
}


(function () {
    var vimppmRepository = [];

    commands.addUserCommand(['vimppm'], 'VIMPeratorPluginManage command',
        function (args) {
            // vimppm "cd01/plugin-vimp" "{'hoge': 'hogehoge'}"
            // JSON.parse(args[1]).hoge;

            var repositoryName = args[0];
            if (isGithubRepository(repositoryName)) repositoryName = repositoryName.split('/')[1];
            var pluginDirPath = vimppmDirPath + '/' + repositoryName;

            if (isDirectory(pluginDirPath)) {
                liberator.execute('set rtp+=' + pluginDirPath);
                liberator.echo('Add ' + pluginDirPath + ' to runtimepath.');
            }

            vimppmRepository.push(args[0]);
        }, {
            subCommands: [
                new Command(
                    ['install'],
                    'install plugin',
                    function (args) {
                        if (args == "") {
                            for (var i = 0; i < vimppmRepository.length; i++) {
                                if (isGithubRepository(vimppmRepository[i]))
                                    installFromGithub(vimppmRepository[i]);
                                else
                                    installFromVimpr(vimppmRepository[i]);
                            }
                        } else {
                            if (isGithubRepository(args))
                                installFromGithub(args);
                            else
                                installFromVimpr(args);
                        }
                        liberator.echo("Vimperator plugins are installed!! Please, restart vimperator.");
                    }
                ),
                new Command(
                    ['update'],
                    'update plugin',
                    function (args) {
                        if (args == "") {
                            for (var i = 0; i < vimppmRepository.length; i++) {
                                if (isGithubRepository(vimppmRepository[i]))
                                    gitPull(vimppmRepository[i]);
                                else
                                    updateFromVimpr(vimppmRepository[i]);
                            }
                        } else {
                            if (isGithubRepository(args[0]))
                                gitPull(args[0]);
                            else
                                updateFromVimpr(args[0]);
                        }
                        liberator.echo("Vimperator plugins are updated. Please, restart vimperator.");
                    }
                )
            ]
        }
    );
})();

// vim:sw=4 ts=4 et :
