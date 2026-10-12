// Function to list the virtual machines in VirtualBox
function listarMaquinasVirtuais(lastUUID) {
    // Run the 'vboxmanage list vms -l' command using the Cockpit API
    cockpit.spawn(['vboxmanage', 'list', 'vms', '-l']).done(function(data) {
        var vmList = data.split('\n\n');

        // Clear the previous list
        var ul = document.getElementById('vmList');
        ul.innerHTML = '';

        // Add the names and status of the virtual machines to the list
        vmList.forEach(function(vm) {
            var li = document.createElement('li');
            li.classList.add('vm-item');
            // Extract the virtual machine name
            var nomeVM = extrairInfoVM(vm, 'Name');
            // Extract the virtual machine status
            var estadoVM = extrairInfoVM(vm, 'State');
            var resultado = dividirEstado(estadoVM);
            var UUID = extrairInfoVM(vm, 'UUID');
            if(lastUUID === UUID){li.classList.add('selected')};
            li.onclick = function() {
                ShowMachineClick(UUID);
            };
            li.id = UUID;
            // Verify that the information was found correctly
            if (nomeVM !== 'Not found' && estadoVM !== 'Not found') {
                // Add the element for the virtual machine name and status
                var nomeNomeElemento = document.createElement('span');
                var nomeEstadoElemento = document.createElement('span');

                nomeNomeElemento.textContent = nomeVM;
                nomeEstadoElemento.textContent = resultado.estado;

                nomeNomeElemento.classList.add('vm-span');
                nomeEstadoElemento.classList.add('vm-span');
                
                adicionarClassState(resultado, li);
                // Add the element to the list
                li.appendChild(nomeNomeElemento);
                li.appendChild(nomeEstadoElemento);
                ul.appendChild(li);
            }
        });
    }).fail(function(error) {
        // Display an error message if command execution fails
        console.error('Error listing virtual machines::', error);
        var ul = document.getElementById('vmList');
        ul.innerHTML = '<li class="vm-item">Error listing virtual machines:: ' + error + '</li>';
    });
}


function ShowMachineClick(UUID) {
    listarMaquinasVirtuais(UUID);
    var items = document.querySelectorAll('.vm-item');
    items.forEach(function (element) {
        element.classList.remove('selected');
    });
    // Run the VBoxManage showvminfo command
    cockpit.spawn(['VBoxManage', 'showvminfo', UUID, "--machinereadable"]).done(function(data) {
        var vmList = data.split('\n\n');
        // Clear the list
        var ul = document.getElementById('vmInfo');
        ul.innerHTML = '';
        var li = document.createElement('li');
        var buttonNew = document.createElement('button');
        var buttonAdd = document.createElement('button');
        var buttonRem = document.createElement('button');
        var buttonSet = document.createElement('button');
        var buttonSto = document.createElement('button');
        var buttonFst = document.createElement('button');

        buttonNew.textContent = "New";
        buttonAdd.textContent = "Add";
        buttonRem.textContent = "Remove";
        buttonSet.textContent = "Settings";
        buttonSto.textContent = "Start";
        buttonFst.textContent = "Force";

        buttonNew.setAttribute('class', 'action-buttons');
        buttonAdd.setAttribute('class', 'action-buttons');
        buttonRem.setAttribute('class', 'action-buttons');
        buttonSet.setAttribute('class', 'action-buttons');
        buttonSto.setAttribute('class', 'action-buttons');
        buttonFst.setAttribute('class', 'action-buttons');

        buttonRem.onclick = function() {
            removeVirtualMachine(UUID);
        };

        buttonNew.onclick = function() {
            newVirtualMachine(UUID);
        };

        buttonFst.onclick = function() {
            shutdownVM(UUID);
        };
        li.appendChild(buttonNew);
        li.appendChild(buttonAdd);
        li.appendChild(buttonRem);
        li.appendChild(buttonSet);
        li.appendChild(buttonSto);
        li.appendChild(buttonFst);
        ul.appendChild(li);
        var lidiv = document.createElement('div');
        lidiv.classList.add('div-form');
        var uldiv = document.createElement('ul');
        vmList.forEach(function(vm) {
            if(vm){
                //general
                var br = document.createElement('br');
                uldiv.appendChild(br);
                var li = document.createElement('li');
                var GeneralElemento = document.createElement('span');
                var BoldElemento = document.createElement('strong');
                BoldElemento.textContent = "General:";
                GeneralElemento.appendChild(BoldElemento);
                li.appendChild(GeneralElemento);
                uldiv.appendChild(li);
                var br = document.createElement('br');
                uldiv.appendChild(br);
                var li = document.createElement('li');
                var NameElemento = document.createElement('span');
                NameElemento.textContent = "Name :            " + machineInfoVM(vm, 'name');
                li.appendChild(NameElemento);
                uldiv.appendChild(li);
                var li = document.createElement('li');
                var GuestElemento = document.createElement('span');
                GuestElemento.textContent = "Guest OS :       " + machineInfoVM(vm, 'ostype');
                li.appendChild(GuestElemento);
                uldiv.appendChild(li);
                var li = document.createElement('li');
                var SystemeElemento = document.createElement('span');
                SystemeElemento.textContent = "CPU exec cap :      " + machineInfoVM(vm, 'cpuexecutioncap');
                li.appendChild(SystemeElemento);
                uldiv.appendChild(li);
                var br = document.createElement('br');
                uldiv.appendChild(br);
                //system
                var li = document.createElement('li');
                var GeneralElemento = document.createElement('span');
                var BoldElemento = document.createElement('strong');
                BoldElemento.textContent = "System:";
                GeneralElemento.appendChild(BoldElemento);
                li.appendChild(GeneralElemento);
                uldiv.appendChild(li);
                var br = document.createElement('br');
                uldiv.appendChild(br);
                var li = document.createElement('li');
                var SystemeElemento = document.createElement('span');
                SystemeElemento.textContent = "Memory size :   " + machineInfoVM(vm, 'memory');
                li.appendChild(SystemeElemento);
                uldiv.appendChild(li);
                var li = document.createElement('li');
                var SystemeElemento = document.createElement('span');
                SystemeElemento.textContent = "State :         " + machineInfoVM(vm, 'VMState');
                li.appendChild(SystemeElemento);
                uldiv.appendChild(li);
                var li = document.createElement('li');
                var SystemeElemento = document.createElement('span');
                SystemeElemento.textContent = "State Time:         " + machineInfoVM(vm, 'VMStateChangeTime');
                li.appendChild(SystemeElemento);
                uldiv.appendChild(li);
                var li = document.createElement('li');
                var SystemeElemento = document.createElement('span');
                SystemeElemento.textContent = "VT-x VPID :     " + machineInfoVM(vm, 'vtxvpid');
                li.appendChild(SystemeElemento);
                uldiv.appendChild(li);
                var li = document.createElement('li');
                var SystemeElemento = document.createElement('span');
                SystemeElemento.textContent = "Autostart Enabled : " + machineInfoVM(vm, 'autostart-enabled');
                li.appendChild(SystemeElemento);
                uldiv.appendChild(li);
                var li = document.createElement('li');
                var SystemeElemento = document.createElement('span');
                SystemeElemento.textContent = "Autostart Delay : " + machineInfoVM(vm, 'autostart-delay');
                li.appendChild(SystemeElemento);
                uldiv.appendChild(li);
                var li = document.createElement('li');
                var SystemeElemento = document.createElement('span');
                SystemeElemento.textContent = "VRDE : " + machineInfoVM(vm, 'vrde');
                li.appendChild(SystemeElemento);
                uldiv.appendChild(li);
                var li = document.createElement('li');
                var SystemeElemento = document.createElement('span');
                SystemeElemento.textContent = "VRDE : " + machineInfoVM(vm, 'vrdeports');
                li.appendChild(SystemeElemento);
                uldiv.appendChild(li);
                var br = document.createElement('br');
                uldiv.appendChild(br);

                //Storage Controllers:
                var li = document.createElement('li');
                var GeneralElemento = document.createElement('span');
                var BoldElemento = document.createElement('strong');
                BoldElemento.textContent = "Storage:";
                GeneralElemento.appendChild(BoldElemento);
                li.appendChild(GeneralElemento);
                uldiv.appendChild(li);
                var br = document.createElement('br');
                uldiv.appendChild(br);
                var li = document.createElement('li');
                var SystemeElemento = document.createElement('span');
                SystemeElemento.textContent = "Storage Controllers :   " + machineInfoVM(vm, 'storagecontrollername0');
                li.appendChild(SystemeElemento);
                uldiv.appendChild(li);
                var br = document.createElement('br');
                uldiv.appendChild(br);

                //Network Controllers:
                var li = document.createElement('li');
                var GeneralElemento = document.createElement('span');
                var BoldElemento = document.createElement('strong');
                BoldElemento.textContent = "Networks:";
                GeneralElemento.appendChild(BoldElemento);
                li.appendChild(GeneralElemento);
                uldiv.appendChild(li);
                var br = document.createElement('br');
                uldiv.appendChild(br);
                var li = document.createElement('li');
                var SystemeElemento = document.createElement('span');
                SystemeElemento.textContent = "NIC 1 :   " + machineInfoVM(vm, 'nic1');
                li.appendChild(SystemeElemento);
                uldiv.appendChild(li);   
                var li = document.createElement('li');
                var SystemeElemento = document.createElement('span');
                SystemeElemento.textContent = "NIC 2 :   " + machineInfoVM(vm, 'nic2');
                li.appendChild(SystemeElemento);
                uldiv.appendChild(li); 
                var li = document.createElement('li');
                var SystemeElemento = document.createElement('span');
                SystemeElemento.textContent = "NIC 3 :   " + machineInfoVM(vm, 'nic3');
                li.appendChild(SystemeElemento);
                uldiv.appendChild(li); 
                var li = document.createElement('li');
                var SystemeElemento = document.createElement('span');
                SystemeElemento.textContent = "NIC 4 :   " + machineInfoVM(vm, 'nic4');
                li.appendChild(SystemeElemento);
                uldiv.appendChild(li); 
                var li = document.createElement('li');
                var SystemeElemento = document.createElement('span');
                SystemeElemento.textContent = "NIC 5 :   " + machineInfoVM(vm, 'nic5');
                li.appendChild(SystemeElemento);
                uldiv.appendChild(li); 
                var li = document.createElement('li');
                var SystemeElemento = document.createElement('span');
                SystemeElemento.textContent = "NIC 6 :   " + machineInfoVM(vm, 'nic6');
                li.appendChild(SystemeElemento);
                uldiv.appendChild(li); 
                var li = document.createElement('li');
                var SystemeElemento = document.createElement('span');
                SystemeElemento.textContent = "NIC 7 :   " + machineInfoVM(vm, 'nic7');
                li.appendChild(SystemeElemento);
                uldiv.appendChild(li); 
                var li = document.createElement('li');
                var SystemeElemento = document.createElement('span');
                SystemeElemento.textContent = "NIC 8 :   " + machineInfoVM(vm, 'nic8');
                li.appendChild(SystemeElemento);
                uldiv.appendChild(li); 

                var estado = machineInfoVM(vm, 'VMState');
                startStopMachine(buttonSto, estado, UUID);
                settingsMachine(buttonSet, estado, UUID);
            };
            lidiv.appendChild(uldiv);
            ul.appendChild(lidiv);
        });
    }).fail(function(error) {
        // Display an error message if retrieving virtual machine details fails
        var ul = document.getElementById('vmList');
        ul.innerHTML = '<li class="vm-item">Error retrieving virtual machine information: ' + error + '</li>';
    });
}

function shutdownVM(UUID) {
    var confirmPowerOff = confirm("Are you sure you want to power off the virtual machine? This action cannot be undone.");
    if (confirmPowerOff) {
        cockpit.spawn(['VBoxManage', 'controlvm', UUID, 'poweroff']).done(function(data) {
            listarMaquinasVirtuais(UUID);
        }).fail(function(error) {
            console.error("Error shutting down the VM:", error);
        });
    }
}

function removeVirtualMachine(UUID){
    var confirmRemoval = confirm("Are you sure you want to remove the virtual machine? This action cannot be undone.");
    if (confirmRemoval) {
        cockpit.spawn(['VBoxManage', 'unregistervm', UUID, "--delete"]).done(function(data) {
            listarMaquinasVirtuais(UUID);
        }).fail(function(error) {
            console.error("Error creating VM:", error);
        });
    }
}

function newVirtualMachine(UUID) {
    var ul = document.getElementById('vmInfo');
    ul.innerHTML = '';

    var li = document.createElement('li');
    var buttonBack = document.createElement('button');
    buttonBack.textContent = "Back";
    buttonBack.setAttribute('class', 'action-buttons');
    buttonBack.onclick = function() {
        ShowMachineClick(UUID);
    };
    var buttonFinish = document.createElement('button');
    buttonFinish.textContent = "Finish";
    buttonFinish.setAttribute('class', 'action-buttons');
    buttonFinish.onclick = function() {
        finishCreation("createNewVBoxID");
    };
    
    var form = document.createElement('form');
    form.id = "createNewVBoxID";
    var br = document.createElement('br');
    form.appendChild(br);

    var CreateElemento = document.createElement('span');
    var BoldElemento = document.createElement('strong');
    BoldElemento.textContent = "Create Virtual Machine:";
    CreateElemento.appendChild(BoldElemento);
    form.appendChild(CreateElemento);

    var br = document.createElement('br');
    form.appendChild(br);
    var br = document.createElement('br');
    form.appendChild(br);

    var NameElemento = document.createElement('span');
    NameElemento.textContent = "Name :            ";
    var nameInput = document.createElement('input');
    nameInput.type = 'text';
    nameInput.id = 'name';
    nameInput.value = 'VirtualBoxMachine';
    form.appendChild(NameElemento);
    form.appendChild(nameInput);

    var typeElemento = document.createElement('span');
    typeElemento.textContent = "Version :            ";
    var typeSelect = document.createElement('select');
    typeSelect.id = 'version';
    cockpit.spawn(['VBoxManage', 'list', 'ostypes']).done(function(data) {
        var output = data.split('\n');
        output.forEach(function(line) {
            if (line.startsWith('ID:')) {
                osID = line.split(':')[1].trim();
            }
            if (line.startsWith('Description:')) {     
                var optionElement = document.createElement('option');                    
                osType = line.split(':')[1].trim();
                optionElement.value = osID;
                optionElement.textContent = osType;
                typeSelect.appendChild(optionElement);
            }
        });

    });

    form.appendChild(typeElemento);
    form.appendChild(typeSelect);

    var br = document.createElement('br');
    form.appendChild(br);
    var br = document.createElement('br');
    form.appendChild(br);

    var memoryElemento = document.createElement('span');
    memoryElemento.textContent = "Memory :            ";
    var memoryInput = document.createElement('input');
    memoryInput.type = 'text';
    memoryInput.id = 'memory';
    memoryInput.value = '1024';
    form.appendChild(memoryElemento);
    form.appendChild(memoryInput);

    var memoryElemento = document.createElement('span');
    var memorySelect = document.createElement('select');
    for($mem=1; $mem <= 16;$mem++){
        var optionElement = document.createElement('option'); 
        optionElement.text = $mem;
        optionElement.value = 1024 * $mem;
        memorySelect.appendChild(optionElement);
    }
    memorySelect.addEventListener("change", function(){
        selectedOption = memorySelect.options[memorySelect.selectedIndex];
        selectedValue = parseInt(selectedOption.value);
        memoryInput.value = selectedValue.toString();
    });
    form.appendChild(memoryElemento);
    form.appendChild(memorySelect);

    var br = document.createElement('br');
    form.appendChild(br);
    var br = document.createElement('br');
    form.appendChild(br);

    var cpusElemento = document.createElement('span');
    cpusElemento.textContent = "Cpus :            ";
    var cpusInput = document.createElement('input');
    cpusInput.type = 'text';
    cpusInput.id = 'cpu';
    cpusInput.value = '1';
    form.appendChild(cpusElemento);
    form.appendChild(cpusInput);

    li.append(buttonBack);
    li.append(buttonFinish);
    ul.appendChild(li);
    
    var li = document.createElement('li');
    var div = document.createElement('div');
    div.id = "CreateElemento";

    div.appendChild(form);
    li.appendChild(div);
    ul.appendChild(li);
}

function editDiscs(){

    var br = document.createElement('br');
    form.appendChild(br);
    var br = document.createElement('br');
    form.appendChild(br);
    var diskLabel = document.createElement('label');
    var diskOption = document.createElement('input');
    diskOption.type = 'radio';
    diskOption.name = 'options';
    diskOption.id = 'option1';
    diskOption.addEventListener("change", function(){
        document.getElementById('group1').style.display="block";
        document.getElementById('group2').style.display="none";
    });
    diskOption.checked = true;
    diskLabel.appendChild(diskOption);
    diskLabel.appendChild(document.createTextNode("Create a Virtual Hard Disk Now"));
    form.appendChild(diskLabel);
    var br = document.createElement('br');
    form.appendChild(br);
    var br = document.createElement('br');
    form.appendChild(br);
    var br = document.createElement('br');
    form.appendChild(br);

    var groupElemento = document.createElement('div');
    groupElemento.id = 'group1';

    var diskElemento = document.createElement('span');
    diskElemento.textContent = "Hard Disk File Location and Size :            ";
    
    var diskInput = document.createElement('input');
    diskInput.type = 'text';
    diskOption.name = 'options';
    diskInput.value = 'NewVirtualDisk1';
    diskInput.id = "folderdisk";

    var disksizeInput = document.createElement('input');
    disksizeInput.type = 'text';
    diskOption.name = 'options';
    disksizeInput.value = '20480';
    disksizeInput.id = "sizedisk";

    groupElemento.appendChild(diskElemento);
    var br = document.createElement('br');
    groupElemento.appendChild(br);
    var br = document.createElement('br');
    groupElemento.appendChild(br);
    groupElemento.appendChild(diskInput);
    var br = document.createElement('br');
    groupElemento.appendChild(br);
    var br = document.createElement('br');
    groupElemento.appendChild(br);
    groupElemento.appendChild(disksizeInput);
    var br = document.createElement('br');
    groupElemento.appendChild(br);
    var br = document.createElement('br');
    groupElemento.appendChild(br);

    form.appendChild(groupElemento);

    var diskLabel = document.createElement('label');
    var diskOption = document.createElement('input');
    diskOption.type = 'radio';
    diskOption.name = 'options';
    diskOption.id = 'option2';
    diskOption.addEventListener("change", function(){
        document.getElementById('group1').style.display="none";
        document.getElementById('group2').style.display="block";
    });
    diskLabel.appendChild(diskOption);
    diskLabel.appendChild(document.createTextNode("Use an Existing Virtual Hard Drive File"));
    form.appendChild(diskLabel);
    var br = document.createElement('br');
    form.appendChild(br);

    var groupElemento = document.createElement('div');
    groupElemento.id = 'group2';
    groupElemento.style.display="none";
    var hddSelect = document.createElement('select');
    hddSelect.name = 'options';
    hddSelect.id =  "diskuuid";
    
    cockpit.spawn(['VBoxManage', 'list', 'hdds']).done(function(data) {
        var output = data.split('\n');
        output.forEach(function(line) {
            if (line.startsWith('UUID:')) {
                hddID = line.split(':')[1].trim();
            }
            if (line.startsWith('Location:')) {      
                var optionElement = document.createElement('option');            
                optionElement.id = hddID;
                optionElement.value = hddID;
                lc = line.split(':')[1].trim();
                lcSrk = lc.replace(/\/[^\/]*\/[^\/]*\/[^\/]*/, '').replace(/^\s*\/\s*/, '').trim();
                var match = lcSrk.match(/\{([^}]+)\}/);
                if (match) {
                    var idValue = match[1].substring(0, 4) + '...';
                    lcSrk = lcSrk.replace(/\{[^}]+\}/, idValue); 
                }
                optionElement.textContent = lcSrk;
                hddSelect.appendChild(optionElement);
            }
            if (line.startsWith('Capacity:')) {                     
                capacity = line.split(':')[1].trim();
                document.getElementById(hddID).textContent = document.getElementById(hddID).textContent + " " + capacity;
            }
        });
    });
    
    groupElemento.appendChild(typeElemento);
    groupElemento.appendChild(hddSelect);

    form.appendChild(groupElemento);

    var diskLabel = document.createElement('label');
    var diskOption = document.createElement('input');
    diskOption.type = 'radio';
    diskOption.name = 'options';
    diskOption.id = 'option3';
    diskOption.addEventListener("change", function(){
        document.getElementById('group1').style.display="none";
        document.getElementById('group2').style.display="none";
    });
    diskLabel.appendChild(diskOption);
    diskLabel.appendChild(document.createTextNode("Do Not Add a Virtual Hard Drive"));
    form.appendChild(diskLabel);

}

function finishCreation(createNewVBoxID){
    var form = document.getElementById(createNewVBoxID);
    var name = document.getElementById("name");
    var version = document.getElementById("version");
    var memory = document.getElementById("memory");
    var cpu = document.getElementById("cpu");
    var folderdisk = document.getElementById("folderdisk");
    var sizedisk = document.getElementById("sizedisk");
    var diskuuid = document.getElementById("diskuuid");

    var command = [
        'VBoxManage',
        'createvm',
        '--name', name.value,
        '--ostype', version.value,
        '--register'
    ];
    cockpit.spawn(command).done(function(data) {
        let newUUID = null;
        var output = data.split('\n');
        output.forEach(function(line) {
            if (line.startsWith('UUID:')) {
                newUUID = line.split(':')[1].trim();                
            }
        });
        var command = [
            'VBoxManage',
            'modifyvm',
            newUUID,
            '--memory', memory.value,
            '--cpus', cpu.value,
            '--vrde', 'on'
        ];
        cockpit.spawn(command).done(function(data) {
            console.log(data);
        }).fail(function(error) {
            console.error("Error modifying VM:", error);
        });
        ShowMachineClick(newUUID);
    }).fail(function(error) {
        console.error("Error creating VM:", error);
    });
}

function createVirtualDisk(name ,sizedisk, folderdisk){
    var command = [
        'VBoxManage',
        'createmedium',
        'disk',
        '--filename', '/home/maverick/VirtualBox\ VMs/' + name + '/' + folderdisk + '.vdi',
        '--size', sizedisk
    ];
    cockpit.spawn(command).done(function(data) {
        var uuidMatch = data.match(/UUID:\s*([a-f0-9\-]+)/);
        if (uuidMatch && uuidMatch[1]) {
            var diskID = uuidMatch[1].trim();
            return diskID;
        } 
    }).fail(function(error) {
        console.error("Error creating DISK:", error);
    });
}

function addStorageController(UUID, state =  'off'){
    var command = [
        'VBoxManage',
        'storagectl',
        UUID,
        '--name', 'SATA',
        '--add', 'sata',
        '--bootable', 'on',
    ];
    console.log(command);
    cockpit.spawn([command]).done(function(data) {
        console.log(data);
    }).fail(function(error) {
        console.error("Error creating storagectl:", error);
    });
}
function attachDisk(UUID, diskFilePath){
    var command = [
        '--storagectl', 'SATA',
        '--port', '1',
        '--device', '0',
        '--type', 'hdd',
        '--medium', diskFilePath
    ];
    cockpit.spawn(['VBoxManage', 'storageattach', UUID, command]).done(function(data) {
        var output = data.split('\n');
        output.forEach(function(line) {
            console.log(line);
            if (line.startsWith('UUID:')) {
                hddID = line.split(':')[1].trim();                
            }
        });
    }).fail(function(error) {
        console.error("Error creating VM:", error);
    });
}


function settingsMachine(button, estado, UUID){
    if(estado == 'poweroff' ){
        button.disabled = false;
        button.onclick = function() {
            showSettings(UUID);
        };
    }else{
        button.disabled = true;
    }
}

function showSettings(UUID){
    var ul = document.getElementById('vmInfo');
    ul.innerHTML = '';

    var li = document.createElement('li');
    var buttonBack = document.createElement('button');
    buttonBack.textContent = "Back";
    buttonBack.setAttribute('class', 'action-buttons');
    buttonBack.onclick = function() {
        ShowMachineClick(UUID);
    };
    var buttonGeneral = document.createElement('button');
    buttonGeneral.textContent = "General";
    buttonGeneral.setAttribute('class', 'action-buttons');
    buttonGeneral.onclick = function() {
        showGeneral(UUID);
    };
    var buttonSystem = document.createElement('button');
    buttonSystem.textContent = "System";
    buttonSystem.setAttribute('class', 'action-buttons');
    buttonSystem.onclick = function() {
        showSystem(UUID);
    };
    var buttonStorage = document.createElement('button');
    buttonStorage.textContent = "Storage";
    buttonStorage.setAttribute('class', 'action-buttons');
    buttonStorage.onclick = function() {
        showStorage(UUID);
    };
    var buttonNetwork = document.createElement('button');
    buttonNetwork.textContent = "Network";
    buttonNetwork.setAttribute('class', 'action-buttons');
    buttonNetwork.onclick = function() {
        showNetworks(UUID);
    };
    var buttonRemoteDisplay = document.createElement('button');
    buttonRemoteDisplay.textContent = "Remote Display";
    buttonRemoteDisplay.setAttribute('class', 'action-buttons');
    buttonRemoteDisplay.onclick = function() {
        showRemoteDisplay(UUID);
    };
    var buttonUSB = document.createElement('button');
    buttonUSB.textContent = "USB";
    buttonUSB.setAttribute('class', 'action-buttons');
    buttonUSB.onclick = function() {
        showUSB(UUID);
    };
    var buttonMedia = document.createElement('button');
    buttonMedia.textContent = "Images";
    buttonMedia.setAttribute('class', 'action-buttons');
    buttonMedia.onclick = function() {
        showMediaManager(UUID);
    };
    var buttonXml = document.createElement('button');
    buttonXml.textContent = "Config XML";
    buttonXml.setAttribute('class', 'action-buttons');
    buttonXml.onclick = function() {
        showXmlConfig(UUID);
    };
    var buttonFolders = document.createElement('button');
    buttonFolders.textContent = "Folders";
    buttonFolders.setAttribute('class', 'action-buttons');
    buttonFolders.onclick = function() {
        alert(UUID);
    };
    li.append(buttonBack);
    li.append(buttonGeneral);
    li.append(buttonSystem);
    li.append(buttonStorage);
    li.append(buttonNetwork);
    li.append(buttonRemoteDisplay);
    li.append(buttonUSB);
    li.append(buttonMedia);
    li.append(buttonXml);
    li.append(buttonFolders);

    ul.appendChild(li);

    var li = document.createElement('li');
    var div = document.createElement('div');
    div.id = "settingsInfo";
    li.appendChild(div);
    ul.appendChild(li);
}

function normalizeVMValue(value) {
    if (value === undefined || value === null || value === 'Not found') {
        return false;
    }
    value = String(value).trim().toLowerCase();
    return value === 'on' || value === 'true' || value === '1' || value === 'enabled';
}

function extractVMSetting(info, keys) {
    if (!info || !keys || !keys.length) {
        return 'Not found';
    }
    for (var i = 0; i < keys.length; i++) {
        var key = keys[i];
        var regex = new RegExp('(?:^|\\n)' + key + '=\\s*"?([^"\\n]+)"?', 'i');
        var match = info.match(regex);
        if (match && match[1]) {
            return match[1].trim();
        }
        var altRegex = new RegExp('(?:^|\\n)' + key + ':\\s*"?([^"\\n]+)"?', 'i');
        var altMatch = info.match(altRegex);
        if (altMatch && altMatch[1]) {
            return altMatch[1].trim();
        }
    }
    return 'Not found';
}

function showRemoteDisplay(UUID){
    var div = document.getElementById('settingsInfo');
    div.innerHTML = '';

    var form = document.createElement('form');
    form.id = 'remoteDisplayForm';

    cockpit.spawn(['VBoxManage', 'showvminfo', UUID, '--machinereadable']).done(function(data) {
        var currentState = normalizeVMValue(extractVMSetting(data, ['vrde', 'vrdeenabled', 'VRDE', 'VRDEEnabled'])) ? 'on' : 'off';
        var currentPort = extractVMSetting(data, ['vrdeport', 'VRDEPort']);
        if (currentPort === 'Not found') {
            currentPort = '3389';
        }
        var currentAddress = extractVMSetting(data, ['vrdeaddress', 'VRDEAddress']);
        if (currentAddress === 'Not found') {
            currentAddress = '127.0.0.1';
        }

        var label = document.createElement('label');
        var enabledInput = document.createElement('input');
        enabledInput.type = 'checkbox';
        enabledInput.checked = currentState === 'on';
        label.appendChild(enabledInput);
        label.appendChild(document.createTextNode(' Enable Remote Display'));
        form.appendChild(label);

        var br = document.createElement('br');
        form.appendChild(br);

        var portLabel = document.createElement('span');
        portLabel.textContent = 'Port: ';
        var portInput = document.createElement('input');
        portInput.type = 'number';
        portInput.value = currentPort;
        portInput.min = '1';
        portInput.max = '65535';
        form.appendChild(portLabel);
        form.appendChild(portInput);

        var br2 = document.createElement('br');
        form.appendChild(br2);

        var addressLabel = document.createElement('span');
        addressLabel.textContent = 'Address: ';
        var addressInput = document.createElement('input');
        addressInput.type = 'text';
        addressInput.value = currentAddress;
        form.appendChild(addressLabel);
        form.appendChild(addressInput);

        var br3 = document.createElement('br');
        form.appendChild(br3);

        var buttonCancel = document.createElement('button');
        buttonCancel.type = 'button';
        buttonCancel.textContent = 'Cancel';
        buttonCancel.onclick = function() {
            showRemoteDisplay(UUID);
        };

        var buttonSave = document.createElement('button');
        buttonSave.type = 'button';
        buttonSave.textContent = 'OK';
        buttonSave.onclick = function() {
            var options = ['VBoxManage', 'modifyvm', UUID];
            var targetState = enabledInput.checked ? 'on' : 'off';
            if (currentState !== targetState) {
                options.push('--vrde', targetState);
            }
            if (portInput.value && portInput.value !== currentPort) {
                options.push('--vrdeport', portInput.value);
            }
            if (addressInput.value && addressInput.value !== currentAddress) {
                options.push('--vrdeaddress', addressInput.value);
            }
            if (options.length > 3) {
                cockpit.spawn(options).done(function() {
                    showRemoteDisplay(UUID);
                }).fail(function(error) {
                    console.error('Error updating remote display:', error);
                    showRemoteDisplay(UUID);
                });
            } else {
                showRemoteDisplay(UUID);
            }
        };

        form.appendChild(buttonCancel);
        form.appendChild(buttonSave);
        div.appendChild(form);
    }).fail(function(error) {
        div.innerHTML = '<p>Error retrieving remote display configuration: ' + error + '</p>';
    });
}

function parseUsbHostEntries(data) {
    var entries = [];
    var current = null;
    var lines = data.split('\n');
    lines.forEach(function(line) {
        if (line.indexOf('UUID:') === 0) {
            if (current) {
                entries.push(current);
            }
            current = {};
            current.uuid = line.split(':')[1].trim();
        } else if (current && line.indexOf('Name:') === 0) {
            current.name = line.split(':')[1].trim();
        } else if (current && line.indexOf('VendorId:') === 0) {
            current.vendorId = line.split(':')[1].trim();
        } else if (current && line.indexOf('ProductId:') === 0) {
            current.productId = line.split(':')[1].trim();
        } else if (current && line.indexOf('Revision:') === 0) {
            current.revision = line.split(':')[1].trim();
        } else if (current && line.indexOf('SerialNumber:') === 0) {
            current.serialNumber = line.split(':')[1].trim();
        }
    });
    if (current) {
        entries.push(current);
    }
    return entries;
}

function addUsbFilter(UUID) {
    var div = document.getElementById('settingsInfo');
    div.innerHTML = '';
    var form = document.createElement('form');
    form.id = 'usbFilterForm';

    var nameField = document.createElement('input');
    nameField.type = 'text';
    nameField.placeholder = 'Filter name';
    nameField.value = 'USB Device';
    form.appendChild(document.createTextNode('Name: '));
    form.appendChild(nameField);
    form.appendChild(document.createElement('br'));

    var vendorField = document.createElement('input');
    vendorField.type = 'text';
    vendorField.placeholder = 'Vendor ID';
    form.appendChild(document.createTextNode('Vendor ID: '));
    form.appendChild(vendorField);
    form.appendChild(document.createElement('br'));

    var productField = document.createElement('input');
    productField.type = 'text';
    productField.placeholder = 'Product ID';
    form.appendChild(document.createTextNode('Product ID: '));
    form.appendChild(productField);
    form.appendChild(document.createElement('br'));

    var portField = document.createElement('input');
    portField.type = 'text';
    portField.placeholder = 'Port';
    form.appendChild(document.createTextNode('Port: '));
    form.appendChild(portField);
    form.appendChild(document.createElement('br'));

    var saveButton = document.createElement('button');
    saveButton.type = 'button';
    saveButton.textContent = 'Add filter';
    saveButton.onclick = function() {
        var args = ['VBoxManage', 'usbfilter', 'add', '0', '--target', UUID, '--name', nameField.value];
        if (vendorField.value) {
            args.push('--vendorid', vendorField.value);
        }
        if (productField.value) {
            args.push('--productid', productField.value);
        }
        if (portField.value) {
            args.push('--port', portField.value);
        }
        cockpit.spawn(args).done(function() {
            showUSB(UUID);
        }).fail(function(error) {
            console.error('Error adding USB filter:', error);
            showUSB(UUID);
        });
    };
    form.appendChild(saveButton);
    div.appendChild(form);
}

function removeUsbFilter(UUID, filterIndex) {
    if (!filterIndex && filterIndex !== 0) {
        return;
    }
    if (confirm('Remove this USB filter?')) {
        cockpit.spawn(['VBoxManage', 'usbfilter', 'remove', String(filterIndex), '--target', UUID]).done(function() {
            showUSB(UUID);
        }).fail(function(error) {
            console.error('Error removing USB filter:', error);
            showUSB(UUID);
        });
    }
}

function showUSB(UUID){
    var div = document.getElementById('settingsInfo');
    div.innerHTML = '';

    var form = document.createElement('form');
    form.id = 'usbForm';

    cockpit.spawn(['VBoxManage', 'showvminfo', UUID, '--machinereadable']).done(function(data) {
        var usbEnabled = normalizeVMValue(extractVMSetting(data, ['usb', 'usbenabled', 'USB', 'USBEnabled']));
        var controllerNames = [];
        var usbFilters = [];
        var output = data.split('\n');
        output.forEach(function(line) {
            if (/usbcontrollername\d*/i.test(line)) {
                var value = line.split('=')[1];
                if (value) {
                    controllerNames.push(value.replace(/"/g, '').trim());
                }
            }
            if (/usbfilter\d*/i.test(line) || /devicefilter\d*/i.test(line)) {
                var value = line.split('=')[1];
                if (value) {
                    usbFilters.push(value.replace(/"/g, '').trim());
                }
            }
        });

        var label = document.createElement('label');
        var enabledInput = document.createElement('input');
        enabledInput.type = 'checkbox';
        enabledInput.checked = usbEnabled;
        label.appendChild(enabledInput);
        label.appendChild(document.createTextNode(' Enable USB'));
        form.appendChild(label);

        var br = document.createElement('br');
        form.appendChild(br);

        if (controllerNames.length > 0) {
            var controllerTitle = document.createElement('strong');
            controllerTitle.textContent = 'USB controllers:';
            form.appendChild(controllerTitle);
            var controllerList = document.createElement('ul');
            controllerNames.forEach(function(controllerName) {
                var item = document.createElement('li');
                item.textContent = controllerName;
                controllerList.appendChild(item);
            });
            form.appendChild(controllerList);
            form.appendChild(document.createElement('br'));
        }

        if (usbFilters.length > 0) {
            var filterTitle = document.createElement('strong');
            filterTitle.textContent = 'USB filters:';
            form.appendChild(filterTitle);
            var filterList = document.createElement('ul');
            usbFilters.forEach(function(filter, index) {
                var item = document.createElement('li');
                item.textContent = filter;
                var removeButton = document.createElement('button');
                removeButton.type = 'button';
                removeButton.textContent = 'Remove';
                removeButton.onclick = function() {
                    removeUsbFilter(UUID, index);
                };
                item.appendChild(removeButton);
                filterList.appendChild(item);
            });
            form.appendChild(filterList);
        } else {
            var noneText = document.createElement('span');
            noneText.textContent = 'No USB device filters found for this VM.';
            form.appendChild(noneText);
        }

        var br2 = document.createElement('br');
        form.appendChild(br2);

        var addFilterButton = document.createElement('button');
        addFilterButton.type = 'button';
        addFilterButton.textContent = 'Add USB filter';
        addFilterButton.onclick = function() {
            addUsbFilter(UUID);
        };
        form.appendChild(addFilterButton);

        var buttonCancel = document.createElement('button');
        buttonCancel.type = 'button';
        buttonCancel.textContent = 'Cancel';
        buttonCancel.onclick = function() {
            showUSB(UUID);
        };

        var buttonSave = document.createElement('button');
        buttonSave.type = 'button';
        buttonSave.textContent = 'OK';
        buttonSave.onclick = function() {
            var options = ['VBoxManage', 'modifyvm', UUID, '--usb', enabledInput.checked ? 'on' : 'off'];
            cockpit.spawn(options).done(function() {
                showUSB(UUID);
            }).fail(function(error) {
                console.error('Error updating USB settings:', error);
                showUSB(UUID);
            });
        };

        form.appendChild(buttonCancel);
        form.appendChild(buttonSave);
        div.appendChild(form);
    }).fail(function(error) {
        div.innerHTML = '<p>Error retrieving USB settings: ' + error + '</p>';
    });
}

function showNetworks(UUID){
    var div = document.getElementById('settingsInfo');
    div.innerHTML = '';
    var form = document.createElement('form');

    cockpit.spawn(['VBoxManage', 'showvminfo', UUID, '--machinereadable']).done(function(data) {
        var adapters = [];
        for (var i = 1; i <= 8; i++) {
            var nicValue = extractVMSetting(data, ['nic' + i]);
            var nicType = extractVMSetting(data, ['nictype' + i]);
            var nicStatus = nicValue === 'Not found' || nicValue === 'none' ? false : true;
            adapters.push({
                slot: i,
                enabled: nicStatus,
                type: nicType === 'Not found' ? 'nat' : nicType,
                value: nicValue === 'Not found' ? 'nat' : nicValue
            });
        }

        var title = document.createElement('strong');
        title.textContent = 'Network adapters';
        form.appendChild(title);
        form.appendChild(document.createElement('br'));

        adapters.forEach(function(adapter) {
            var label = document.createElement('label');
            var enabledInput = document.createElement('input');
            enabledInput.type = 'checkbox';
            enabledInput.checked = adapter.enabled;
            label.appendChild(enabledInput);
            label.appendChild(document.createTextNode(' NIC ' + adapter.slot + ' '));
            form.appendChild(label);

            var typeSelect = document.createElement('select');
            ['none', 'nat', 'bridged', 'hostonly', 'intnet', 'natnetwork', 'generic'].forEach(function(optionValue) {
                var option = document.createElement('option');
                option.value = optionValue;
                option.textContent = optionValue;
                if (adapter.value === optionValue || adapter.type === optionValue) {
                    option.selected = true;
                }
                typeSelect.appendChild(option);
            });
            form.appendChild(typeSelect);
            form.appendChild(document.createElement('br'));
        });

        var saveButton = document.createElement('button');
        saveButton.type = 'button';
        saveButton.textContent = 'Save';
        saveButton.onclick = function() {
            var args = ['VBoxManage', 'modifyvm', UUID];
            var adapterInputs = form.querySelectorAll('input[type="checkbox"]');
            var selects = form.querySelectorAll('select');
            for (var i = 0; i < adapterInputs.length; i++) {
                var slot = i + 1;
                var enabled = adapterInputs[i].checked;
                var type = selects[i].value;
                args.push('--nic' + slot, enabled ? type : 'none');
            }
            cockpit.spawn(args).done(function() {
                showNetworks(UUID);
            }).fail(function(error) {
                console.error('Error updating network adapters:', error);
                showNetworks(UUID);
            });
        };
        form.appendChild(saveButton);
        div.appendChild(form);
    }).fail(function(error) {
        div.innerHTML = '<p>Error retrieving network settings: ' + error + '</p>';
    });
}

function parseVirtualBoxMediaOutput(data) {
    var items = [];
    var current = null;
    var lines = data.split('\n');
    lines.forEach(function(line) {
        if (!line || line.trim() === '') {
            if (current) {
                items.push(current);
                current = null;
            }
            return;
        }
        if (line.indexOf('UUID:') === 0) {
            if (current) {
                items.push(current);
            }
            current = { uuid: line.split(':')[1].trim() };
        } else if (current && line.indexOf('Location:') === 0) {
            current.location = line.split(':')[1].trim();
        } else if (current && line.indexOf('Name:') === 0) {
            current.name = line.split(':')[1].trim();
        } else if (current && line.indexOf('Storage format:') === 0) {
            current.format = line.split(':')[1].trim();
        }
    });
    if (current) {
        items.push(current);
    }
    return items;
}

function showMediaManager(UUID) {
    var div = document.getElementById('settingsInfo');
    div.innerHTML = '';
    var form = document.createElement('form');
    form.id = 'mediaManagerForm';

    var controllerSelect = document.createElement('select');
    var portInput = document.createElement('input');
    var deviceInput = document.createElement('input');
    var typeSelect = document.createElement('select');
    var mediaSelect = document.createElement('select');
    var saveButton = document.createElement('button');

    portInput.type = 'number';
    portInput.value = '0';
    portInput.min = '0';
    portInput.max = '30';
    deviceInput.type = 'number';
    deviceInput.value = '0';
    deviceInput.min = '0';
    deviceInput.max = '30';

    typeSelect.appendChild(new Option('hdd', 'hdd'));
    typeSelect.appendChild(new Option('dvddrive', 'dvddrive'));

    cockpit.spawn(['VBoxManage', 'showvminfo', UUID, '--machinereadable']).done(function(data) {
        var controllers = [];
        data.split('\n').forEach(function(line) {
            if (line.indexOf('storagecontrollername') === 0) {
                controllers.push(line.split('=')[1].replace(/"/g, '').trim());
            }
        });
        if (controllers.length === 0) {
            controllers = ['IDE', 'SATA'];
        }
        controllers.forEach(function(name) {
            controllerSelect.appendChild(new Option(name, name));
        });

        cockpit.spawn(['VBoxManage', 'list', 'hdds']).done(function(hddData) {
            var items = parseVirtualBoxMediaOutput(hddData);
            cockpit.spawn(['VBoxManage', 'list', 'dvds']).done(function(dvdData) {
                var media = items.concat(parseVirtualBoxMediaOutput(dvdData));
                if (!media.length) {
                    mediaSelect.appendChild(new Option('No images found', ''));
                } else {
                    media.forEach(function(item) {
                        var label = item.location || item.name || item.uuid;
                        mediaSelect.appendChild(new Option(label, label));
                    });
                }

                form.appendChild(document.createTextNode('Controller: '));
                form.appendChild(controllerSelect);
                form.appendChild(document.createElement('br'));
                form.appendChild(document.createTextNode('Port: '));
                form.appendChild(portInput);
                form.appendChild(document.createElement('br'));
                form.appendChild(document.createTextNode('Device: '));
                form.appendChild(deviceInput);
                form.appendChild(document.createElement('br'));
                form.appendChild(document.createTextNode('Type: '));
                form.appendChild(typeSelect);
                form.appendChild(document.createElement('br'));
                form.appendChild(document.createTextNode('Image: '));
                form.appendChild(mediaSelect);
                form.appendChild(document.createElement('br'));

                saveButton.type = 'button';
                saveButton.textContent = 'Attach image';
                saveButton.onclick = function() {
                    var targetMedia = mediaSelect.value;
                    if (!targetMedia) {
                        alert('No image selected.');
                        return;
                    }
                    cockpit.spawn(['VBoxManage', 'storageattach', UUID,
                        '--storagectl', controllerSelect.value,
                        '--port', String(portInput.value),
                        '--device', String(deviceInput.value),
                        '--type', typeSelect.value,
                        '--medium', targetMedia]).done(function() {
                        showMediaManager(UUID);
                    }).fail(function(error) {
                        console.error('Error attaching image:', error);
                        alert('Error attaching image: ' + error);
                    });
                };
                form.appendChild(saveButton);
                div.appendChild(form);
            }).fail(function(err) {
                div.innerHTML = '<p>Error listing ISOs: ' + err + '</p>';
            });
        }).fail(function(err) {
            div.innerHTML = '<p>Error listing virtual disks: ' + err + '</p>';
        });
    }).fail(function(error) {
        div.innerHTML = '<p>Error loading VM storage configuration: ' + error + '</p>';
    });
}

function readMachineConfigFile(UUID, callback) {
    cockpit.spawn(['VBoxManage', 'showvminfo', UUID, '--machinereadable']).done(function(data) {
        var configFile = extractVMSetting(data, ['Config file', 'configfile', 'cfgfile']);
        if (configFile === 'Not found') {
            callback(null, null, 'Config file not found');
            return;
        }
        cockpit.spawn(['bash', '-c', 'cat "' + configFile.replace(/"/g, '\\"') + '"']).done(function(xmlData) {
            callback(configFile, xmlData, null);
        }).fail(function(error) {
            callback(configFile, null, error);
        });
    }).fail(function(error) {
        callback(null, null, error);
    });
}

function exportTextFile(fileName, textContent) {
    var blob = new Blob([textContent], { type: 'application/xml;charset=utf-8' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
}

function showXmlConfig(UUID){
    var div = document.getElementById('settingsInfo');
    div.innerHTML = '';
    var form = document.createElement('form');

    readMachineConfigFile(UUID, function(configFile, xmlText, error) {
        var info = document.createElement('p');
        info.textContent = configFile || 'Config file unavailable';
        form.appendChild(info);

        var textarea = document.createElement('textarea');
        textarea.rows = 24;
        textarea.cols = 100;
        textarea.value = xmlText || ''; 
        form.appendChild(textarea);
        form.appendChild(document.createElement('br'));

        var exportButton = document.createElement('button');
        exportButton.type = 'button';
        exportButton.textContent = 'Export XML';
        exportButton.onclick = function() {
            exportTextFile((UUID || 'vmconfig') + '.vbox', textarea.value);
        };
        form.appendChild(exportButton);

        var saveButton = document.createElement('button');
        saveButton.type = 'button';
        saveButton.textContent = 'Save to VM config';
        saveButton.onclick = function() {
            if (!configFile) {
                alert('VM config file path not found.');
                return;
            }
            var safePath = configFile.replace(/'/g, "'\\''");
            var command = "cat > '" + safePath + "' <<'__VM_XML__'\n" + textarea.value + "\n__VM_XML__";
            cockpit.spawn(['bash', '-c', command]).done(function() {
                alert('VM config XML saved.');
            }).fail(function(err) {
                alert('Error saving config XML: ' + err);
            });
        };
        form.appendChild(saveButton);
        div.appendChild(form);
    });
}

function showGeneral(UUID){
    var div = document.getElementById('settingsInfo');
    div.innerHTML = '';

    var form = document.createElement('form');
    cockpit.spawn(['VBoxManage', 'showvminfo', UUID, "--machinereadable"]).done(function(data) {
        var vmList = data.split('\n\n');
        vmList.forEach(function(vm) {
            if(vm){
                var br = document.createElement('br');
                form.appendChild(br);

                var GeneralElemento = document.createElement('span');
                var BoldElemento = document.createElement('strong');
                BoldElemento.textContent = "General:";
                GeneralElemento.appendChild(BoldElemento);
                form.appendChild(GeneralElemento);

                var br = document.createElement('br');
                form.appendChild(br);
                var br = document.createElement('br');
                form.appendChild(br);

                var NameElemento = document.createElement('span');
                NameElemento.textContent = "Name :            ";
                var nameInput = document.createElement('input');
                nameInput.type = 'text';
                nameInput.value = machineInfoVM(vm, 'name');
                form.appendChild(NameElemento);
                form.appendChild(nameInput);

                var br = document.createElement('br');
                form.appendChild(br);
                var br = document.createElement('br');
                form.appendChild(br);
                actualostype = machineInfoVM(vm, 'type');
                var typeElemento = document.createElement('span');
                typeElemento.textContent = "Version :            ";
                var typeSelect = document.createElement('select');
                cockpit.spawn(['VBoxManage', 'list', 'ostypes']).done(function(data) {
                    var output = data.split('\n');
                    output.forEach(function(line) {
                        if (line.startsWith('ID:')) {
                            osID = line.split(':')[1].trim();
                        }
                        if (line.startsWith('Description:')) {     
                            var optionElement = document.createElement('option');                    
                            osType = line.split(':')[1].trim();
                            if (osType === machineInfoVM(vm, 'type')) {
                                optionElement.selected = true;
                            }
                            optionElement.value = osID;
                            optionElement.textContent = osType;
                            typeSelect.appendChild(optionElement);
                        }
                    });

                });
                
                form.appendChild(typeElemento);
                form.appendChild(typeSelect);

                var br = document.createElement('br');
                form.appendChild(br);
                var br = document.createElement('br');
                form.appendChild(br);
                var SnapshotElemento = document.createElement('span');
                SnapshotElemento.textContent = "Snapshot Folder :            ";
                var snapshotInput = document.createElement('input');
                snapshotInput.type = 'text';
                snapshotInput.value = machineInfoVM(vm, 'SnapFldr');
                form.appendChild(SnapshotElemento);
                form.appendChild(snapshotInput);

                var br = document.createElement('br');
                form.appendChild(br);
                var br = document.createElement('br');
                form.appendChild(br);

                var buttonCancel = document.createElement('button');
                buttonCancel.textContent = "Cancel";
                buttonCancel.onclick = function() {
                    showGeneral(UUID);
                    alert('Changes canceled!');
                };

                var buttonSave = document.createElement('button');
                buttonSave.textContent = "OK";
                buttonSave.onclick = function() {
                    showGeneral(UUID);
                    alert('General settings saved successfully!');
                };
                form.appendChild(buttonCancel);
                form.appendChild(buttonSave);
            }
        });
    }).fail(function(error) {
        var ul = document.getElementById('vmList');
        ul.innerHTML = '<li class="vm-item">Error retrieving virtual machine information: ' + error + '</li>';
    });
    div.appendChild(form);
}

function showSystem(UUID){
    var div = document.getElementById('settingsInfo');
    div.innerHTML = '';

    var form = document.createElement('form');
    cockpit.spawn(['VBoxManage', 'showvminfo', UUID, "--machinereadable"]).done(function(data) {
        var vmList = data.split('\n\n');
        vmList.forEach(function(vm) {
            if(vm){
                var br = document.createElement('br');
                form.appendChild(br);

                var GeneralElemento = document.createElement('span');
                var BoldElemento = document.createElement('strong');
                BoldElemento.textContent = "System:";
                GeneralElemento.appendChild(BoldElemento);
                form.appendChild(GeneralElemento);

                var br = document.createElement('br');
                form.appendChild(br);
                var br = document.createElement('br');
                form.appendChild(br);

                var cpusElemento = document.createElement('span');
                cpusElemento.textContent = "Cpus :            ";
                var cpusInput = document.createElement('input');
                cpusInput.type = 'text';
                cpusInput.value = machineInfoVM(vm, 'cpus');
                form.appendChild(cpusElemento);
                form.appendChild(cpusInput);

                var br = document.createElement('br');
                form.appendChild(br);
                var br = document.createElement('br');
                form.appendChild(br);

                var memoryElemento = document.createElement('span');
                memoryElemento.textContent = "Memory :            ";
                var memoryInput = document.createElement('input');
                memoryInput.type = 'text';
                memoryInput.value = machineInfoVM(vm, 'memory');
                form.appendChild(memoryElemento);
                form.appendChild(memoryInput);

                var memoryElemento = document.createElement('span');
                var memorySelect = document.createElement('select');
                for($mem=1; $mem <= 16;$mem++){
                    var optionElement = document.createElement('option'); 
                    optionElement.text = $mem;
                    optionElement.value = 1024 * $mem;
                    if($mem ==  machineInfoVM(vm, 'memory') / 1024){
                        optionElement.selected = true;
                    }
                    memorySelect.appendChild(optionElement);
                }
                memorySelect.addEventListener("change", function(){
                    selectedOption = memorySelect.options[memorySelect.selectedIndex];
                    selectedValue = parseInt(selectedOption.value);
                    memoryInput.value = selectedValue.toString();
                });
                form.appendChild(memoryElemento);
                form.appendChild(memorySelect);

                var br = document.createElement('br');
                form.appendChild(br);
                var br = document.createElement('br');
                form.appendChild(br);

                var buttonCancel = document.createElement('button');
                buttonCancel.textContent = "Cancel";
                buttonCancel.onclick = function() {
                    showSystem(UUID);
                    alert('Changes canceled!');
                };

                var buttonSave = document.createElement('button');
                buttonSave.textContent = "OK";
                buttonSave.onclick = function() {
                    var changed = false;
                    var options = ["modifyvm", UUID];
                    if(memoryInput.value !== machineInfoVM(vm, 'memory')){
                        changed = true;
                        options.push("--memory", memoryInput.value);
                    }
                    if(cpusInput.value !== machineInfoVM(vm, 'cpus')){
                        changed = true;
                        options.push("--cpus", cpusInput.value);
                    }
                    if(changed){
                        var result = confirm("Do you want to proceed?");
                        if (result) {
                            cockpit.spawn(['VBoxManage'].concat(options)).done(function(data) {
                                showSystem(UUID);
                            }).fail(function(err) {
                                showSystem(UUID);
                            });
                        } else {
                            showSystem(UUID);
                        }
                    }else{
                        showSystem(UUID);
                    }
                };
                form.appendChild(buttonCancel);
                form.appendChild(buttonSave);
            }
        });
    }).fail(function(error) {
        var ul = document.getElementById('vmList');
        ul.innerHTML = '<li class="vm-item">Error retrieving virtual machine information: ' + error + '</li>';
    });
    div.appendChild(form);
}

function addController(vmId) {
    var detailsContainer = document.querySelector('.details-container');
    detailsContainer.innerHTML = '';

    var form = document.createElement('form');
    form.className = 'add-controller-form';

    var nameLabel = document.createElement('label');
    nameLabel.textContent = 'Controller Name:';
    var nameInput = document.createElement('input');
    nameInput.type = 'text';
    nameInput.id = 'controllerName';
    nameInput.required = true;
    form.appendChild(nameLabel);
    form.appendChild(nameInput);
    form.appendChild(document.createElement('br'));

    var typeLabel = document.createElement('label');
    typeLabel.textContent = 'Controller Type:';
    var typeSelect = document.createElement('select');
    typeSelect.id = 'controllerType';
    var types = ['sata', 'ide', 'scsi', 'usb', 'pci'];
    types.forEach(function(type) {
        var option = document.createElement('option');
        option.value = type;
        option.textContent = type.charAt(0).toUpperCase() + type.slice(1);
        typeSelect.appendChild(option);
    });
    form.appendChild(typeLabel);
    form.appendChild(typeSelect);
    form.appendChild(document.createElement('br'));

    var bootableLabel = document.createElement('label');
    bootableLabel.textContent = 'Bootable:';
    var bootableSelect = document.createElement('select');
    bootableSelect.id = 'bootableOption';
    var bootableOptions = ['on', 'off'];
    bootableOptions.forEach(function(option) {
        var bootOption = document.createElement('option');
        bootOption.value = option;
        bootOption.textContent = option.charAt(0).toUpperCase() + option.slice(1);
        bootableSelect.appendChild(bootOption);
    });
    form.appendChild(bootableLabel);
    form.appendChild(bootableSelect);
    form.appendChild(document.createElement('br'));

    var saveButton = document.createElement('button');
    saveButton.type = 'button';
    saveButton.textContent = 'Save';
    saveButton.onclick = function() {
        var controllerName = nameInput.value;
        var controllerType = typeSelect.value;
        var bootable = bootableSelect.value;
        var command = `VBoxManage storagectl ${vmId} --name ${controllerName} --add ${controllerType} --bootable ${bootable}`;
        console.log("Command to be executed:", command);
        cockpit.spawn(command.split(' ')).done(function() {
            alert("Controller added successfully: " + controllerName);
            showStorage(vmId);
        }).fail(function(error) {
            alert("Error adding controller: " + error);
            console.error("Error:", error);
        });
    };
    form.appendChild(saveButton);
    detailsContainer.appendChild(form);
}

function removeController(vmId, controllerName) {
    if (confirm("Are you sure you want to remove the controller: " + controllerName + "?")) {
        var command = `VBoxManage storagectl ${vmId} --name ${controllerName} --remove`;
        console.log("Command to be executed:", command);
        var commandArray = command.split(/\s+/);
        cockpit.spawn(commandArray).done(function(data) {
            alert("Controller removed successfully: " + controllerName);
            showStorage(vmId);
        }).fail(function(error) {
            alert("Error removing controller: " + error.message);
            console.error("Error:", error);
            console.error("Command output:", error.data);
        });
    }
}

function showStorage(UUID) {
    var div = document.getElementById('settingsInfo');
    div.innerHTML = '';

    var container = document.createElement('div');
    container.className = 'main-container';
    var storageContainer = document.createElement('div');
    storageContainer.className = 'storage-container';
    var detailsContainer = document.createElement('div');
    detailsContainer.className = 'details-container';

    container.appendChild(storageContainer);
    container.appendChild(detailsContainer);
    div.appendChild(container);

    var CreateElemento = document.createElement('span');
    var BoldElemento = document.createElement('strong');
    BoldElemento.textContent = "Storage:";
    CreateElemento.appendChild(BoldElemento);
    storageContainer.appendChild(CreateElemento);

    var br = document.createElement('br');
    storageContainer.appendChild(br);
    var br = document.createElement('br');
    storageContainer.appendChild(br);

    cockpit.spawn(['VBoxManage', 'showvminfo', UUID, '--machinereadable']).done(function(data) {
        var output = data.split('\n');
        var currentController = null;

        output.forEach(function(line) {
            if (line.startsWith('storagecontrollername')) {
                if (currentController) {
                    storageContainer.appendChild(currentController);
                }
                var storagecontrollername = line.split('=')[1].trim();
                currentController = document.createElement('div');
                currentController.className = 'storage-controller';
                currentController.innerHTML = "<strong>Controller: " + storagecontrollername + "</strong><br>";

                var addButton = document.createElement('button');
                addButton.textContent = '+';
                addButton.onclick = function() {
                    addDisk(UUID, storagecontrollername);
                    alert("Add a new disk to the controller: " + storagecontrollername);
                };
                currentController.appendChild(addButton);

                var removeButton = document.createElement('button');
                removeButton.textContent = '-';
                removeButton.onclick = function() {
                    removeController(UUID, storagecontrollername);
                };
                currentController.appendChild(removeButton);
            } else if (line.startsWith('"IDE-') || line.startsWith('"SATA-')) {
                if (line.endsWith('.iso"') || line.endsWith('.vdi"')) {
                    var fileItem = document.createElement('div');
                    fileItem.className = 'storage-item';
                    var fileName = line.split('/').pop();
                    var filePath = line.split('=')[1].trim().replace(/\"/g, '');

                    fileItem.textContent = fileName;
                    fileItem.onclick = function() {
                        detailsContainer.innerHTML = "<strong>Item Details:</strong><br>" +
                            "Name: " + fileName + "<br>" +
                            "Path: <input type='text' id='diskPath' value='" + filePath + "' style='width: 100%;'/>" +
                            "<br><button id='saveButton'>Save</button>";

                        if (fileName.endsWith('.vdi')) {
                            var currentSize = "10GB";
                            var virtualSize = "20GB";
                            detailsContainer.innerHTML += "<br>Current Size: " + currentSize + "<br>Virtual Size: " + virtualSize;
                        }

                        document.getElementById('saveButton').onclick = function() {
                            var newPath = document.getElementById('diskPath').value;
                            console.log("New path saved:", newPath);
                            alert("Path saved: " + newPath);
                        };
                    };

                    currentController.appendChild(fileItem);
                }
            }
        });

        if (currentController) {
            storageContainer.appendChild(currentController);
        }

        var addControllerButton = document.createElement('button');
        addControllerButton.textContent = 'Add Controller';
        addControllerButton.onclick = function() {
            addController(UUID);
        };
        storageContainer.appendChild(addControllerButton);
    });
}

function addDisk(UUID, storageControllerName) {
    var detailsContainer = document.querySelector('.details-container');
    detailsContainer.innerHTML = '';

    var form = document.createElement('form');
    form.className = 'add-disk-form';

    var diskLabel = document.createElement('label');
    diskLabel.textContent = 'Disk Path (.iso or .vdi):';
    var diskInput = document.createElement('input');
    diskInput.type = 'text';
    diskInput.id = 'diskPath';
    diskInput.required = true;
    form.appendChild(diskLabel);
    form.appendChild(diskInput);
    form.appendChild(document.createElement('br'));

    var portLabel = document.createElement('label');
    portLabel.textContent = 'Port:';
    var portSelect = document.createElement('select');
    portSelect.id = 'diskPort';
    for (var i = 0; i < 4; i++) {
        var option = document.createElement('option');
        option.value = i;
        option.textContent = i;
        portSelect.appendChild(option);
    }
    form.appendChild(portLabel);
    form.appendChild(portSelect);
    form.appendChild(document.createElement('br'));

    var deviceLabel = document.createElement('label');
    deviceLabel.textContent = 'Device:';
    var deviceSelect = document.createElement('select');
    deviceSelect.id = 'diskDevice';
    var devices = ['0', '1'];
    devices.forEach(function(device) {
        var option = document.createElement('option');
        option.value = device;
        option.textContent = device;
        deviceSelect.appendChild(option);
    });
    form.appendChild(deviceLabel);
    form.appendChild(deviceSelect);
    form.appendChild(document.createElement('br'));

    var typeLabel = document.createElement('label');
    typeLabel.textContent = 'Disk Type:';
    var typeSelect = document.createElement('select');
    typeSelect.id = 'diskType';
    var types = ['dvddrive', 'hdd'];
    types.forEach(function(type) {
        var option = document.createElement('option');
        option.value = type;
        option.textContent = type.charAt(0).toUpperCase() + type.slice(1);
        typeSelect.appendChild(option);
    });
    form.appendChild(typeLabel);
    form.appendChild(typeSelect);
    form.appendChild(document.createElement('br'));

    var sizeLabel = document.createElement('label');
    sizeLabel.textContent = 'Disk Size (MB):';
    var sizeInput = document.createElement('input');
    sizeInput.type = 'number';
    sizeInput.id = 'diskSize';
    sizeInput.required = true;
    form.appendChild(sizeLabel);
    form.appendChild(sizeInput);
    form.appendChild(document.createElement('br'));

    var saveButton = document.createElement('button');
    saveButton.type = 'button';
    saveButton.textContent = 'Save';
    saveButton.onclick = function() {
        var diskPath = diskInput.value;
        var diskPort = portSelect.value;
        var diskDevice = deviceSelect.value;
        var diskType = typeSelect.value;
        var diskSize = sizeInput.value;

        if (diskType === 'dvddrive') {
            var command = `VBoxManage storageattach ${UUID} --storagectl ${storageControllerName} --port ${diskPort} --device ${diskDevice} --type dvddrive --medium ${diskPath}`;
            cockpit.spawn(command.split(' ')).done(function() {
                alert("Disk added successfully: " + diskPath);
                showStorage(UUID);
            }).fail(function(error) {
                alert("Error adding disk: " + error.message);
                console.error("Error:", error);
            });
        } else if (diskType === 'hdd') {
            var createCommand = `VBoxManage createmedium disk --filename "${diskPath}" --size ${diskSize}`;
            cockpit.spawn(createCommand.split(' ')).done(function() {
                var attachCommand = `VBoxManage storageattach ${UUID} --storagectl ${storageControllerName} --port ${diskPort} --device ${diskDevice} --type hdd --medium "${diskPath}"`;
                cockpit.spawn(attachCommand.split(' ')).done(function() {
                    alert("HDD disk added successfully: " + diskPath);
                    showStorage(UUID);
                }).fail(function(error) {
                    alert("Error attaching HDD disk: " + error.message);
                    console.error("Error:", error);
                });
            }).fail(function(error) {
                alert("Error creating HDD disk: " + error.message);
                console.error("Error:", error);
            });
        }
    };
    form.appendChild(saveButton);
    detailsContainer.appendChild(form);
}

function showNetworks(UUID){
    var div = document.getElementById('settingsInfo');
    div.innerHTML = ''; // Clear the previous content

    var form = document.createElement('form');

    var input = document.createElement('input');
    input.type = 'text';
    input.placeholder = 'Type your command here';
    input.id = 'commandInput';
    form.appendChild(input);

    var button = document.createElement('button');
    button.type = 'button';
    button.textContent = 'Run Command';
    button.addEventListener('click', function() {
        var command = input.value;
        if (command) {
            cockpit.spawn(['bash', '-c', command]).then(function(output) {
                console.log('Command output:', output);
            }).catch(function(error) {
                console.error('Error executing the command:', error);
            });
        } else {
            console.warn('Please type a command.');
        }
    });

    form.appendChild(button);

    var dirButton = document.createElement('button');
    dirButton.type = 'button';
    dirButton.textContent = 'Browse Directories';
    dirButton.addEventListener('click', function() {
        navigateDirectories('/');
    });

    form.appendChild(dirButton);
    div.appendChild(form);
}

function navigateDirectories(path) {
    cockpit.spawn(['bash', '-c', `ls -l "${path}"`]).then(function(output) {
        var div = document.getElementById('settingsInfo');
        div.innerHTML = '';

        var files = output.split('\n');
        var list = document.createElement('ul');

        files.forEach(function(file) {
            if (file) {
                var listItem = document.createElement('li');
                listItem.textContent = file;
                listItem.addEventListener('click', function() {
                    var parts = file.split(/\s+/);
                    var dirName = parts[parts.length - 1];
                    navigateDirectories(`${path}/${dirName}`);
                });
                list.appendChild(listItem);
            }
        });

        var backButton = document.createElement('button');
        backButton.textContent = 'Back';
        backButton.addEventListener('click', function() {
            var parentPath = path.split('/').slice(0, -1).join('/') || '/';
            navigateDirectories(parentPath);
        });

        div.appendChild(backButton);
        div.appendChild(list);
    }).catch(function(error) {
        console.error('Error listing directories:', error);
    });
}

function startStopMachine(buttonSto, estado, UUID){
    switch (estado) {
        case 'running':
            buttonSto.textContent = 'Stop';
            buttonSto.onclick = function() {
                cockpit.spawn(['VBoxManage', 'controlvm', UUID, 'acpipowerbutton']).done(function(data) {
                    console.log(UUID);
                    console.log(data);
                }).fail(function(err) {
                    ShowMachineClick(UUID);
                });
            };
            break;
        case 'poweroff':
            buttonSto.textContent = 'Start';
            buttonSto.onclick = function() {
                cockpit.spawn(['VBoxManage', 'startvm', UUID, '--type', 'headless']).done(function(data) {
                    ShowMachineClick(UUID);
                }).fail(function(err) {
                    ShowMachineClick(UUID);
                });
            };
            break;
        case 'saved':
            buttonSto.textContent = 'Return';
            break;
        default:
            buttonSto.textContent = 'Start';
            break;
    }
}

function extrairInfoVM(info, chave) {
    var regex = new RegExp(chave + ':\\s*(.+?)\\s*(?:\n|$)', 'i');
    var match = info.match(regex);
    return match ? match[1] : 'Not found';
}

function machineInfoVM(info, chave) {
    var regex = new RegExp(chave + '=\\s*"?([^"\n]+)"?', 'i');
    var match = info.match(regex);
    return match ? match[1] : 'Not found';
}

function adicionarClassState(resultado, li) {
    if (resultado.estado === "running") {
        li.classList.add('vm-item-running');
    }else{
        li.classList.remove('vm-item-running');
    }
}

function dividirEstado(s) {
    var index = s.indexOf('(since)');
    var estado = "";

    if (index !== -1) {
        estado = s.substring(0, index).trim();
    } else {
        estado = s.trim();
    }
    estado = estado.split(' ')[0];
    return { estado: estado };
}

window.onload = listarMaquinasVirtuais;
