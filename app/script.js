function runVBoxManage(args) {
    return new Promise(function(resolve, reject) {
        cockpit.spawn(args).done(function(data) {
            resolve(data);
        }).fail(function(error) {
            reject(error);
        });
    });
}

function escapeShellSingle(value) {
    return "'" + String(value).replace(/'/g, "'\"'\"'") + "'";
}

function listVMs() {
    var listEl = document.getElementById('vmList');
    if (!listEl) {
        return;
    }

    listEl.innerHTML = '';
    runVBoxManage(['VBoxManage', 'list', 'vms', '-l'])
        .then(function(data) {
            var blocks = data.split(/\n\s*\n/).filter(Boolean);
            blocks.forEach(function(block) {
                var name = (block.match(/Name:\s*(.+)/i) || [])[1];
                var uuid = (block.match(/UUID:\s*([0-9a-f-]+)/i) || [])[1];
                var state = (block.match(/State:\s*(.+)/i) || [])[1];
                if (!name || !uuid) {
                    return;
                }

                var li = document.createElement('li');
                li.className = 'vm-item';
                li.id = uuid;
                li.textContent = name + ' (' + (state || 'unknown') + ')';
                li.onclick = function() {
                    showMachine(uuid);
                };
                listEl.appendChild(li);
            });
        })
        .catch(function(error) {
            console.error('Error listing VMs:', error);
            listEl.innerHTML = '<li class="vm-item">Error listing VMs: ' + error + '</li>';
        });
}

function showMachine(uuid) {
    var infoEl = document.getElementById('vmInfo');
    if (!infoEl) {
        return;
    }

    infoEl.innerHTML = '';
    runVBoxManage(['VBoxManage', 'showvminfo', uuid, '--machinereadable'])
        .then(function(data) {
            var info = parseMachinereadable(data);
            var row = document.createElement('div');
            row.className = 'vm-overview';
            row.innerHTML = '<strong>' + (info.name || uuid) + '</strong><br>' +
                'Guest OS: ' + (info.ostype || 'unknown') + '<br>' +
                'VM State: ' + (info.vmstate || 'unknown') + '<br>';
            infoEl.appendChild(row);

            var buttonBar = document.createElement('div');
            buttonBar.className = 'action-bar';

            var actions = [
                {label: 'Settings', fn: function() { showSettings(uuid); }},
                {label: 'Start', fn: function() { startVM(uuid); }},
                {label: 'Stop', fn: function() { stopVM(uuid); }},
                {label: 'Power Off', fn: function() { powerOffVM(uuid); }},
                {label: 'Remove', fn: function() { removeVM(uuid); }}
            ];

            actions.forEach(function(action) {
                var button = document.createElement('button');
                button.type = 'button';
                button.textContent = action.label;
                button.onclick = action.fn;
                buttonBar.appendChild(button);
            });

            infoEl.appendChild(buttonBar);
        })
        .catch(function(error) {
            console.error('Error reading VM info:', error);
            infoEl.innerHTML = '<div>Error reading VM info: ' + error + '</div>';
        });
}

function parseMachinereadable(data) {
    var result = {};
    var lines = String(data || '').split(/\r?\n/);
    lines.forEach(function(line) {
        if (!line || line.indexOf('=') === -1) {
            return;
        }
        var idx = line.indexOf('=');
        var key = line.slice(0, idx).trim();
        var value = line.slice(idx + 1).trim();
        if (value && value.length >= 2 && value[0] === '"' && value[value.length - 1] === '"') {
            value = value.slice(1, -1);
        }
        result[key.toLowerCase()] = value;
    });
    return result;
}

function startVM(uuid) {
    return runVBoxManage(['VBoxManage', 'startvm', uuid, '--type', 'headless'])
        .then(function() { showMachine(uuid); })
        .catch(function(error) { console.error('Error starting VM:', error); alert('Error starting VM: ' + error); });
}

function stopVM(uuid) {
    return runVBoxManage(['VBoxManage', 'controlvm', uuid, 'acpipowerbutton'])
        .then(function() { showMachine(uuid); })
        .catch(function(error) { console.error('Error stopping VM:', error); alert('Error stopping VM: ' + error); });
}

function powerOffVM(uuid) {
    if (!confirm('Power off this VM?')) {
        return;
    }
    return runVBoxManage(['VBoxManage', 'controlvm', uuid, 'poweroff'])
        .then(function() { showMachine(uuid); })
        .catch(function(error) { console.error('Error powering off VM:', error); alert('Error powering off VM: ' + error); });
}

function removeVM(uuid) {
    if (!confirm('Remove this VM? This cannot be undone.')) {
        return;
    }
    return runVBoxManage(['VBoxManage', 'unregistervm', uuid, '--delete'])
        .then(function() { listVMs(); })
        .catch(function(error) { console.error('Error removing VM:', error); alert('Error removing VM: ' + error); });
}

function showSettings(uuid) {
    var infoEl = document.getElementById('vmInfo');
    if (!infoEl) {
        return;
    }

    infoEl.innerHTML = '';
    var buttons = [
        'General', 'System', 'Storage', 'Network', 'Remote Display', 'USB', 'Images', 'Config XML'
    ];

    var bar = document.createElement('div');
    bar.className = 'action-bar';
    buttons.forEach(function(label) {
        var button = document.createElement('button');
        button.type = 'button';
        button.textContent = label;
        button.onclick = function() {
            switch (label) {
                case 'General': showGeneral(uuid); break;
                case 'System': showSystem(uuid); break;
                case 'Storage': showStorage(uuid); break;
                case 'Network': showNetwork(uuid); break;
                case 'Remote Display': showRemoteDisplay(uuid); break;
                case 'USB': showUSB(uuid); break;
                case 'Images': showMediaManager(uuid); break;
                case 'Config XML': showXmlConfig(uuid); break;
            }
        };
        bar.appendChild(button);
    });
    infoEl.appendChild(bar);

    var panel = document.createElement('div');
    panel.id = 'settingsInfo';
    infoEl.appendChild(panel);
    showGeneral(uuid);
}

function showGeneral(uuid) {
    var panel = document.getElementById('settingsInfo');
    if (!panel) {
        return;
    }

    panel.innerHTML = 'Loading general settings...';
    runVBoxManage(['VBoxManage', 'showvminfo', uuid, '--machinereadable'])
        .then(function(data) {
            var info = parseMachinereadable(data);
            panel.innerHTML = '';
            var form = document.createElement('form');
            var fields = [
                {label: 'Name', value: info.name || '', key: 'name'},
                {label: 'Guest OS Type', value: info.ostype || '', key: 'ostype'},
                {label: 'Snapshot Folder', value: info.snapshotfolder || '', key: 'snapshotfolder'}
            ];
            fields.forEach(function(field) {
                var row = document.createElement('div');
                var label = document.createElement('label');
                label.textContent = field.label + ': ';
                var input = document.createElement('input');
                input.type = 'text';
                input.value = field.value;
                row.appendChild(label);
                row.appendChild(input);
                form.appendChild(row);
            });
            var save = document.createElement('button');
            save.type = 'button';
            save.textContent = 'Save';
            save.onclick = function() { alert('General settings save is not yet implemented in this branch.'); };
            form.appendChild(save);
            panel.appendChild(form);
        })
        .catch(function(error) {
            panel.innerHTML = '<div>Error loading general settings: ' + error + '</div>';
        });
}

function showSystem(uuid) {
    var panel = document.getElementById('settingsInfo');
    if (!panel) {
        return;
    }

    panel.innerHTML = 'Loading system settings...';
    runVBoxManage(['VBoxManage', 'showvminfo', uuid, '--machinereadable'])
        .then(function(data) {
            var info = parseMachinereadable(data);
            panel.innerHTML = '';
            var form = document.createElement('form');
            var rows = [
                {label: 'Memory', value: info.memory || '1024', key: 'memory'},
                {label: 'CPU count', value: info.cpus || '1', key: 'cpus'},
                {label: 'VRDE', value: info.vrde || 'off', key: 'vrde'}
            ];
            rows.forEach(function(rowInfo) {
                var row = document.createElement('div');
                var label = document.createElement('label');
                label.textContent = rowInfo.label + ': ';
                var input = document.createElement('input');
                input.type = 'text';
                input.value = rowInfo.value;
                row.appendChild(label);
                row.appendChild(input);
                form.appendChild(row);
            });
            var save = document.createElement('button');
            save.type = 'button';
            save.textContent = 'Save';
            save.onclick = function() { alert('System settings save is not yet implemented in this branch.'); };
            form.appendChild(save);
            panel.appendChild(form);
        })
        .catch(function(error) {
            panel.innerHTML = '<div>Error loading system settings: ' + error + '</div>';
        });
}

function parseStorageLayout(info) {
    var controllers = {};
    var lines = String(info || '').split(/\r?\n/);

    lines.forEach(function(line) {
        var m = line.match(/^storagecontrollername(\d+)\s*=\s*"?([^"\n]+)"?/i);
        if (m) {
            var idx = parseInt(m[1], 10);
            controllers[idx] = {
                index: idx,
                name: m[2].trim(),
                ports: []
            };
            return;
        }

        var used = line.match(/^([A-Za-z]+)(\d+)-(\d+)\s*=\s*"?([^"\n]+)"?/);
        if (used) {
            var keyName = used[1].toUpperCase();
            var controllerIndex = parseInt(used[2], 10);
            var portIndex = parseInt(used[3], 10);
            if (controllers[controllerIndex]) {
                controllers[controllerIndex].ports.push({
                    port: portIndex,
                    value: used[4].trim()
                });
            }
        }
    });

    return Object.keys(controllers).map(function(k) {
        return controllers[parseInt(k, 10)];
    });
}

function findBestStorageAttachmentPoint(info, preferredControllerName) {
    var controllers = parseStorageLayout(info);
    var selected = null;
    if (preferredControllerName) {
        selected = controllers.filter(function(c) { return c.name.toLowerCase() === String(preferredControllerName).toLowerCase(); })[0];
    }
    selected = selected || controllers[0] || { name: 'SATA', ports: [] };

    var usedPorts = {};
    selected.ports.forEach(function(portInfo) {
        usedPorts[portInfo.port] = true;
    });

    var port = 0;
    while (usedPorts[port]) {
        port += 1;
    }

    return {
        controller: selected.name,
        port: port,
        device: 0
    };
}

function showStorage(uuid) {
    var panel = document.getElementById('settingsInfo');
    if (!panel) {
        return;
    }

    panel.innerHTML = 'Loading storage...';
    runVBoxManage(['VBoxManage', 'showvminfo', uuid, '--machinereadable'])
        .then(function(data) {
            panel.innerHTML = '';
            var info = parseMachinereadable(data);
            var controllers = parseStorageLayout(data);
            if (!controllers.length) {
                panel.innerHTML = '<div>No storage controllers found.</div>';
                return;
            }

            var list = document.createElement('ul');
            controllers.forEach(function(controller) {
                var item = document.createElement('li');
                var title = document.createElement('strong');
                title.textContent = controller.name || 'Controller';
                item.appendChild(title);

                var attachButton = document.createElement('button');
                attachButton.type = 'button';
                attachButton.textContent = 'Attach media';
                attachButton.onclick = function() {
                    var target = findBestStorageAttachmentPoint(data, controller.name);
                    showMediaManager(uuid, controller.name, target.port);
                };
                item.appendChild(document.createTextNode(' '));
                item.appendChild(attachButton);
                list.appendChild(item);
            });
            panel.appendChild(list);
        })
        .catch(function(error) {
            panel.innerHTML = '<div>Error loading storage: ' + error + '</div>';
        });
}

function getMediaList() {
    return Promise.all([
        runVBoxManage(['VBoxManage', 'list', 'hdds']),
        runVBoxManage(['VBoxManage', 'list', 'dvds'])
    ]).then(function(results) {
        var items = [];
        results.forEach(function(raw) {
            var blocks = String(raw).split(/\n\s*\n/).filter(Boolean);
            blocks.forEach(function(block) {
                var uuid = (block.match(/UUID:\s*([0-9a-f-]+)/i) || [])[1];
                var location = (block.match(/Location:\s*(.+)/i) || [])[1];
                var name = (block.match(/Name:\s*(.+)/i) || [])[1];
                var format = (block.match(/Storage format:\s*(.+)/i) || [])[1];
                if (uuid || location || name) {
                    items.push({
                        uuid: uuid || '',
                        location: location || '',
                        name: name || '',
                        format: format || ''
                    });
                }
            });
        });
        return items;
    });
}

function showMediaManager(uuid, preferredControllerName, preferredPort) {
    var panel = document.getElementById('settingsInfo');
    if (!panel) {
        return;
    }

    panel.innerHTML = 'Loading media...';
    Promise.all([
        runVBoxManage(['VBoxManage', 'showvminfo', uuid, '--machinereadable']),
        getMediaList()
    ])
        .then(function(results) {
            var info = parseMachinereadable(results[0]);
            var media = results[1];
            var slot = findBestStorageAttachmentPoint(results[0], preferredControllerName || 'SATA');
            if (typeof preferredPort === 'number') {
                slot.port = preferredPort;
            }

            panel.innerHTML = '';
            var form = document.createElement('form');

            var controllerLabel = document.createElement('label');
            controllerLabel.textContent = 'Controller: ';
            var controllerSelect = document.createElement('select');
            var controllers = parseStorageLayout(results[0]);
            controllers.forEach(function(controller) {
                var option = document.createElement('option');
                option.value = controller.name;
                option.textContent = controller.name;
                if (controller.name === slot.controller) {
                    option.selected = true;
                }
                controllerSelect.appendChild(option);
            });
            form.appendChild(controllerLabel);
            form.appendChild(controllerSelect);
            form.appendChild(document.createElement('br'));

            var portLabel = document.createElement('label');
            portLabel.textContent = 'Port: ';
            var portInput = document.createElement('input');
            portInput.type = 'number';
            portInput.value = String(slot.port);
            portInput.min = '0';
            portInput.max = '30';
            form.appendChild(portLabel);
            form.appendChild(portInput);
            form.appendChild(document.createElement('br'));

            var deviceLabel = document.createElement('label');
            deviceLabel.textContent = 'Device: ';
            var deviceInput = document.createElement('input');
            deviceInput.type = 'number';
            deviceInput.value = String(slot.device);
            deviceInput.min = '0';
            deviceInput.max = '30';
            form.appendChild(deviceLabel);
            form.appendChild(deviceInput);
            form.appendChild(document.createElement('br'));

            var typeLabel = document.createElement('label');
            typeLabel.textContent = 'Type: ';
            var typeSelect = document.createElement('select');
            ['hdd', 'dvddrive'].forEach(function(type) {
                var option = document.createElement('option');
                option.value = type;
                option.textContent = type;
                typeSelect.appendChild(option);
            });
            form.appendChild(typeLabel);
            form.appendChild(typeSelect);
            form.appendChild(document.createElement('br'));

            var mediaLabel = document.createElement('label');
            mediaLabel.textContent = 'Image: ';
            var mediaSelect = document.createElement('select');
            if (!media.length) {
                var none = document.createElement('option');
                none.value = '';
                none.textContent = 'No media found';
                mediaSelect.appendChild(none);
            }
            media.forEach(function(item) {
                var option = document.createElement('option');
                option.value = item.location || item.uuid || item.name;
                option.textContent = (item.name || item.location || item.uuid) + (item.format ? ' (' + item.format + ')' : '');
                mediaSelect.appendChild(option);
            });
            form.appendChild(mediaLabel);
            form.appendChild(mediaSelect);
            form.appendChild(document.createElement('br'));

            var attachButton = document.createElement('button');
            attachButton.type = 'button';
            attachButton.textContent = 'Attach selected media';
            attachButton.onclick = function() {
                var selected = mediaSelect.value;
                if (!selected) {
                    alert('Select an image first.');
                    return;
                }
                var args = ['VBoxManage', 'storageattach', uuid,
                    '--storagectl', controllerSelect.value,
                    '--port', String(portInput.value),
                    '--device', String(deviceInput.value),
                    '--type', typeSelect.value,
                    '--medium', selected
                ];
                runVBoxManage(args)
                    .then(function() {
                        alert('Media attached successfully.');
                        showMediaManager(uuid, controllerSelect.value, Number(portInput.value));
                    })
                    .catch(function(error) {
                        alert('Failed to attach media: ' + error);
                    });
            };
            form.appendChild(attachButton);
            panel.appendChild(form);
        })
        .catch(function(error) {
            panel.innerHTML = '<div>Error loading media: ' + error + '</div>';
        });
}

function showNetwork(uuid) {
    var panel = document.getElementById('settingsInfo');
    if (!panel) {
        return;
    }
    panel.innerHTML = 'Loading network settings...';
    runVBoxManage(['VBoxManage', 'showvminfo', uuid, '--machinereadable'])
        .then(function(data) {
            var lines = String(data).split(/\r?\n/);
            panel.innerHTML = '';
            var list = document.createElement('ul');
            for (var i = 1; i <= 8; i += 1) {
                var nic = lines.filter(function(line) { return new RegExp('^nic' + i + '\\s*=', 'i').test(line); })[0] || '';
                var value = nic ? nic.split('=')[1].replace(/"/g, '').trim() : 'none';
                var item = document.createElement('li');
                item.textContent = 'NIC ' + i + ': ' + value;
                list.appendChild(item);
            }
            panel.appendChild(list);
        })
        .catch(function(error) {
            panel.innerHTML = '<div>Error loading network settings: ' + error + '</div>';
        });
}

function normalizeUsbValue(value) {
    if (value === undefined || value === null || value === 'Not found') {
        return false;
    }
    var lower = String(value).trim().toLowerCase();
    return lower === 'on' || lower === 'true' || lower === '1' || lower === 'enabled';
}

function validateUsbFilterConfig(data) {
    var errors = [];
    var name = String(data.name || '').trim();
    var vendorId = String(data.vendorId || '').trim();
    var productId = String(data.productId || '').trim();
    var revision = String(data.revision || '').trim();
    var serialNumber = String(data.serialNumber || '').trim();
    var port = String(data.port || '').trim();

    if (!name) {
        errors.push('USB filter name is required.');
    }

    if (vendorId && !/^(0x)?[0-9A-Fa-f]{4}$/.test(vendorId)) {
        errors.push('Vendor ID must be 4 hex digits, for example 046D or 0x046D.');
    }
    if (productId && !/^(0x)?[0-9A-Fa-f]{4}$/.test(productId)) {
        errors.push('Product ID must be 4 hex digits, for example 082D or 0x082D.');
    }
    if (revision && !/^(0x)?[0-9A-Fa-f]{1,4}$/.test(revision)) {
        errors.push('Revision must be numeric or hex (for example 0100 or 0x0100).');
    }
    if (serialNumber && serialNumber.length > 64) {
        errors.push('Serial number is too long; keep it under 64 characters.');
    }
    if (port && !/^(0x)?[0-9A-Fa-f]{1,4}$/.test(port) && !/^[0-9]{1,5}$/.test(port)) {
        errors.push('Port must be a valid numeric or hex value.');
    }

    return { valid: errors.length === 0, errors: errors };
}

function buildUsbFilterCommand(uuid, config) {
    var validated = validateUsbFilterConfig(config);
    if (!validated.valid) {
        throw new Error(validated.errors.join(' '));
    }

    var args = ['VBoxManage', 'usbfilter', 'add', '0', '--target', uuid, '--name', config.name];
    if (config.vendorId) {
        args.push('--vendorid', config.vendorId);
    }
    if (config.productId) {
        args.push('--productid', config.productId);
    }
    if (config.revision) {
        args.push('--revision', config.revision);
    }
    if (config.manufacturer) {
        args.push('--manufacturer', config.manufacturer);
    }
    if (config.product) {
        args.push('--product', config.product);
    }
    if (config.serialNumber) {
        args.push('--serialnumber', config.serialNumber);
    }
    if (config.port) {
        args.push('--port', config.port);
    }
    return args;
}

function addUsbFilter(uuid) {
    var panel = document.getElementById('settingsInfo');
    if (!panel) {
        return;
    }

    panel.innerHTML = '';
    var form = document.createElement('form');
    var fields = [
        {label: 'Name', key: 'name', value: 'USB Device'},
        {label: 'Vendor ID', key: 'vendorId', value: ''},
        {label: 'Product ID', key: 'productId', value: ''},
        {label: 'Revision', key: 'revision', value: ''},
        {label: 'Manufacturer', key: 'manufacturer', value: ''},
        {label: 'Product', key: 'product', value: ''},
        {label: 'Serial Number', key: 'serialNumber', value: ''},
        {label: 'Port', key: 'port', value: ''}
    ];

    var refs = {};
    fields.forEach(function(field) {
        var row = document.createElement('div');
        var label = document.createElement('label');
        label.textContent = field.label + ': ';
        var input = document.createElement('input');
        input.type = 'text';
        input.value = field.value;
        refs[field.key] = input;
        row.appendChild(label);
        row.appendChild(input);
        form.appendChild(row);
    });

    var saveButton = document.createElement('button');
    saveButton.type = 'button';
    saveButton.textContent = 'Add filter';
    saveButton.onclick = function() {
        var config = {};
        Object.keys(refs).forEach(function(key) {
            config[key] = refs[key].value.trim();
        });

        try {
            var args = buildUsbFilterCommand(uuid, config);
            runVBoxManage(args)
                .then(function() {
                    showUSB(uuid);
                })
                .catch(function(error) {
                    alert('USB filter validation failed: ' + error.message);
                });
        } catch (error) {
            alert(error.message);
        }
    };

    form.appendChild(saveButton);
    panel.appendChild(form);
}

function removeUsbFilter(uuid, index) {
    if (!confirm('Remove this USB filter?')) {
        return;
    }
    runVBoxManage(['VBoxManage', 'usbfilter', 'remove', String(index), '--target', uuid])
        .then(function() { showUSB(uuid); })
        .catch(function(error) { alert('Failed to remove USB filter: ' + error); });
}

function showUSB(uuid) {
    var panel = document.getElementById('settingsInfo');
    if (!panel) {
        return;
    }

    panel.innerHTML = 'Loading USB settings...';
    runVBoxManage(['VBoxManage', 'showvminfo', uuid, '--machinereadable'])
        .then(function(data) {
            var info = parseMachinereadable(data);
            var usbEnabled = normalizeUsbValue(info.usb || info.usbenabled || info.usbcontrollername0);
            var lines = String(data).split(/\r?\n/);
            var filters = [];
            lines.forEach(function(line) {
                var match = line.match(/^usbfilter(\d+)\s*=\s*"?(.+?)"?\s*$/i);
                if (match) {
                    filters.push({ index: parseInt(match[1], 10), value: match[2].trim() });
                }
            });

            panel.innerHTML = '';
            var form = document.createElement('form');
            var enableRow = document.createElement('div');
            var checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.checked = usbEnabled;
            enableRow.appendChild(checkbox);
            enableRow.appendChild(document.createTextNode(' Enable USB'));
            form.appendChild(enableRow);

            var list = document.createElement('ul');
            if (filters.length) {
                filters.forEach(function(filter) {
                    var li = document.createElement('li');
                    li.textContent = filter.value;
                    var removeButton = document.createElement('button');
                    removeButton.type = 'button';
                    removeButton.textContent = 'Remove';
                    removeButton.onclick = function() { removeUsbFilter(uuid, filter.index); };
                    li.appendChild(document.createTextNode(' '));
                    li.appendChild(removeButton);
                    list.appendChild(li);
                });
            } else {
                var li = document.createElement('li');
                li.textContent = 'No USB device filters defined.';
                list.appendChild(li);
            }
            form.appendChild(list);

            var addButton = document.createElement('button');
            addButton.type = 'button';
            addButton.textContent = 'Add USB filter';
            addButton.onclick = function() { addUsbFilter(uuid); };
            form.appendChild(addButton);

            var saveButton = document.createElement('button');
            saveButton.type = 'button';
            saveButton.textContent = 'Save';
            saveButton.onclick = function() {
                runVBoxManage(['VBoxManage', 'modifyvm', uuid, '--usb', checkbox.checked ? 'on' : 'off'])
                    .then(function() { showUSB(uuid); })
                    .catch(function(error) { alert('Failed to save USB settings: ' + error); });
            };
            form.appendChild(saveButton);
            panel.appendChild(form);
        })
        .catch(function(error) {
            panel.innerHTML = '<div>Error loading USB settings: ' + error + '</div>';
        });
}

function readMachineConfigFile(uuid) {
    return runVBoxManage(['VBoxManage', 'showvminfo', uuid, '--machinereadable'])
        .then(function(data) {
            var info = parseMachinereadable(data);
            var configFile = info['configfile'] || info['config file'] || info.configfile;
            if (!configFile) {
                return { configFile: null, error: 'Config file not found.' };
            }
            return runVBoxManage(['bash', '-c', 'cat ' + escapeShellSingle(configFile)])
                .then(function(xml) {
                    return { configFile: configFile, xml: xml, error: null };
                })
                .catch(function(error) {
                    return { configFile: configFile, xml: null, error: error };
                });
        });
}

function backupXmlFile(configFile) {
    if (!configFile) {
        return null;
    }
    var backup = configFile + '.bak';
    return 'if [ -f ' + escapeShellSingle(configFile) + ' ]; then cp -f ' + escapeShellSingle(configFile) + ' ' + escapeShellSingle(backup) + '; fi';
}

function writeXmlConfigAtomically(configFile, xmlText) {
    var tmpPath = configFile + '.tmp';
    var commands = [
        'set -e',
        backupXmlFile(configFile),
        'printf %s ' + escapeShellSingle(xmlText) + ' > ' + escapeShellSingle(tmpPath),
        'mv -f ' + escapeShellSingle(tmpPath) + ' ' + escapeShellSingle(configFile)
    ];
    return runVBoxManage(['bash', '-lc', commands.join('; ') ]);
}

function showXmlConfig(uuid) {
    var panel = document.getElementById('settingsInfo');
    if (!panel) {
        return;
    }

    panel.innerHTML = 'Loading VM XML...';
    readMachineConfigFile(uuid)
        .then(function(result) {
            panel.innerHTML = '';
            var form = document.createElement('form');
            var pathLabel = document.createElement('div');
            pathLabel.textContent = result.configFile || 'Config file unavailable';
            form.appendChild(pathLabel);

            var textarea = document.createElement('textarea');
            textarea.rows = 26;
            textarea.cols = 100;
            textarea.value = result.xml || '';
            form.appendChild(textarea);

            var exportButton = document.createElement('button');
            exportButton.type = 'button';
            exportButton.textContent = 'Export XML';
            exportButton.onclick = function() {
                var blob = new Blob([textarea.value], { type: 'application/xml;charset=utf-8' });
                var url = URL.createObjectURL(blob);
                var a = document.createElement('a');
                a.href = url;
                a.download = (uuid || 'vm-config') + '.vbox';
                a.click();
                URL.revokeObjectURL(url);
            };
            form.appendChild(exportButton);

            var saveButton = document.createElement('button');
            saveButton.type = 'button';
            saveButton.textContent = 'Save XML';
            saveButton.onclick = function() {
                if (!result.configFile) {
                    alert('No VM config file path is available.');
                    return;
                }
                if (!confirm('This will back up the current .vbox file before overwriting. Continue?')) {
                    return;
                }
                writeXmlConfigAtomically(result.configFile, textarea.value)
                    .then(function() {
                        alert('VM XML saved successfully. Backup created as .bak');
                    })
                    .catch(function(error) {
                        alert('Failed to save VM XML: ' + error);
                    });
            };
            form.appendChild(saveButton);
            panel.appendChild(form);
        })
        .catch(function(error) {
            panel.innerHTML = '<div>Error reading VM config XML: ' + error + '</div>';
        });
}

function showRemoteDisplay(uuid) {
    var panel = document.getElementById('settingsInfo');
    if (!panel) {
        return;
    }

    panel.innerHTML = 'Loading remote display settings...';
    runVBoxManage(['VBoxManage', 'showvminfo', uuid, '--machinereadable'])
        .then(function(data) {
            var info = parseMachinereadable(data);
            panel.innerHTML = '';
            var form = document.createElement('form');
            var enabled = document.createElement('input');
            enabled.type = 'checkbox';
            enabled.checked = normalizeUsbValue(info.vrde || info.vrdeenabled);

            var portInput = document.createElement('input');
            portInput.type = 'number';
            portInput.value = info.vrdeport || '3389';
            portInput.min = '1';
            portInput.max = '65535';

            var addressInput = document.createElement('input');
            addressInput.type = 'text';
            addressInput.value = info.vrdeaddress || '127.0.0.1';

            form.appendChild(enabled);
            form.appendChild(document.createTextNode(' Enable Remote Display'));
            form.appendChild(document.createElement('br'));
            form.appendChild(document.createTextNode('Port: '));
            form.appendChild(portInput);
            form.appendChild(document.createElement('br'));
            form.appendChild(document.createTextNode('Address: '));
            form.appendChild(addressInput);
            form.appendChild(document.createElement('br'));

            var save = document.createElement('button');
            save.type = 'button';
            save.textContent = 'Save';
            save.onclick = function() {
                var args = ['VBoxManage', 'modifyvm', uuid, '--vrde', enabled.checked ? 'on' : 'off'];
                if (String(portInput.value).trim()) {
                    args.push('--vrdeport', String(portInput.value).trim());
                }
                if (String(addressInput.value).trim()) {
                    args.push('--vrdeaddress', String(addressInput.value).trim());
                }
                runVBoxManage(args)
                    .then(function() { showRemoteDisplay(uuid); })
                    .catch(function(error) { alert('Failed to save remote display settings: ' + error); });
            };
            form.appendChild(save);
            panel.appendChild(form);
        })
        .catch(function(error) {
            panel.innerHTML = '<div>Error loading remote display: ' + error + '</div>';
        });
}

window.addEventListener('load', function() {
    listVMs();
});
