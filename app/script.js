// --- Remote Display (VRDE) handling ---
// Assumes runVBoxManage(commandArray) returns a Promise resolving stdout string
// and parseMachinereadable(text) parses simple key="value" lines into an object.
// Add the following functions near your other settings functions (next to showUSB etc).

function parseVrdePropertiesFromOutput(text) {
    // Accept lines like:
    // VRDE="on"
    // VRDEProperty "Security/Method"="NEGOTIATE"
    // VRDEProperty "Security/ServerCertificate"="/path/to/cert"
    var lines = String(text).split(/\r?\n/);
    var vrde = { enabled: false, properties: {} };
    lines.forEach(function(line) {
        var m = line.match(/^\s*VRDE\s*=\s*"?(.+?)"?\s*$/i);
        if (m) {
            vrde.enabled = String(m[1]).toLowerCase() === 'on' || String(m[1]).toLowerCase() === 'true';
        }
        var m2 = line.match(/^\s*VRDEProperty\s+"([^"]+)"\s*=\s*"?(.+?)"?\s*$/i);
        if (m2) {
            vrde.properties[m2[1]] = m2[2];
        }
        // fallbacks (some VBox versions / configs)
        var m3 = line.match(/^\s*vrdeproperty-([^=]+)\s*=\s*"?(.+?)"?\s*$/i);
        if (m3) {
            vrde.properties[m3[1]] = m3[2];
        }
    });
    return vrde;
}

function showRemoteDisplay(uuid) {
    var panel = document.getElementById('settingsInfo');
    if (!panel) return;

    panel.innerHTML = 'Loading Remote Display settings...';
    runVBoxManage(['VBoxManage', 'showvminfo', uuid, '--machinereadable'])
    .then(function(output) {
        var vrde = parseVrdePropertiesFromOutput(output);

        panel.innerHTML = '';
        var form = document.createElement('form');

        var enableRow = document.createElement('div');
        var checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.checked = vrde.enabled;
        enableRow.appendChild(checkbox);
        enableRow.appendChild(document.createTextNode(' Enable Remote Display (VRDE)'));
        form.appendChild(enableRow);

        // Friendly fields: Security/Method, ServerCertificate, ServerPrivateKey, VNC password
        var prop = vrde.properties || {};

        function addField(labelText, propName, value, placeholder) {
            var row = document.createElement('div');
            var lbl = document.createElement('label');
            lbl.textContent = labelText + ': ';
            var inp = document.createElement('input');
            inp.type = 'text';
            inp.value = value || '';
            inp.placeholder = placeholder || '';
            inp.dataset.propName = propName;
            row.appendChild(lbl);
            row.appendChild(inp);
            form.appendChild(row);
            return inp;
        }

        var securityMethodInput = addField('Security Method', 'Security/Method', prop['Security/Method'] || '');
        var serverCertInput = addField('Server Certificate (path)', 'Security/ServerCertificate', prop['Security/ServerCertificate'] || '');
        var serverKeyInput = addField('Server Private Key (path)', 'Security/ServerPrivateKey', prop['Security/ServerPrivateKey'] || '');
        // VNC password: show masked if present
        var vncPresent = !!prop['VNCPassword'];
        var vncRow = document.createElement('div');
        var vncLabel = document.createElement('label');
        vncLabel.textContent = 'VNC Password: ';
        var vncInput = document.createElement('input');
        vncInput.type = 'password';
        vncInput.placeholder = vncPresent ? '********' : '';
        vncRow.appendChild(vncLabel);
        vncRow.appendChild(vncInput);
        form.appendChild(vncRow);

        // list raw properties
        var propsList = document.createElement('ul');
        Object.keys(prop).forEach(function(k) {
            var li = document.createElement('li');
            li.textContent = k + ' = ' + (k === 'VNCPassword' ? '******' : prop[k]);
            propsList.appendChild(li);
        });
        form.appendChild(propsList);

        // Save button
        var saveButton = document.createElement('button');
        saveButton.type = 'button';
        saveButton.textContent = 'Save Remote Display';
        saveButton.onclick = function() {
            var cmds = ['VBoxManage', 'modifyvm', uuid, '--vrde', checkbox.checked ? 'on' : 'off'];
            var toSet = [];
            if (securityMethodInput.value) toSet.push({k:'Security/Method', v:securityMethodInput.value});
            if (serverCertInput.value) toSet.push({k:'Security/ServerCertificate', v:serverCertInput.value});
            if (serverKeyInput.value) toSet.push({k:'Security/ServerPrivateKey', v:serverKeyInput.value});
            if (vncInput.value) toSet.push({k:'VNCPassword', v:vncInput.value});

            // Append --vrdeproperty name=value for each
            toSet.forEach(function(item) {
                // VBoxManage modifyvm accepts --vrdeproperty <name>=<value>
                cmds.push('--vrdeproperty');
                cmds.push(item.k + '=' + item.v);
            });

            // Run command
            runVBoxManage(cmds)
            .then(function() {
                // Refresh UI
                showRemoteDisplay(uuid);
            })
            .catch(function(err) {
                alert('Failed to save Remote Display settings: ' + err);
            });
        };
        form.appendChild(saveButton);

        panel.appendChild(form);
    })
    .catch(function(err) {
        panel.innerHTML = '<div>Error loading Remote Display settings: ' + err + '</div>';
    });
}

// Optionally: hook into your settings UI where you list "USB" to also show "Remote Display".
// Example: create a button that calls showRemoteDisplay(uuid) next to USB controls.