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
            if (nomeVM !== 'Não encontrado' && estadoVM !== 'Não encontrado') {
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
/*
    var br = document.createElement('br');
    form.appendChild(br);
    var br = document.createElement('br');
    form.appendChild(br);
    
    var FolderElemento = document.createElement('span');
    FolderElemento.textContent = "Folder :            ";
    var folderInput = document.createElement('input');
    folderInput.type = 'text';
    folderInput.id = 'folder';
    folderInput.value = '~/VirtualBox\ VMs/';
    //form.appendChild(FolderElemento);
    //form.appendChild(folderInput);

    var br = document.createElement('br');
    form.appendChild(br);
    var br = document.createElement('br');
    form.appendChild(br);

    var ISOElemento = document.createElement('span');
    ISOElemento.textContent = "ISO :            ";
    var isoInput = document.createElement('input');
    isoInput.type = 'text';
    isoInput.id = 'iso';
    isoInput.value = '~/Downloads/';
    form.appendChild(ISOElemento);
    form.appendChild(isoInput);

    var br = document.createElement('br');
    form.appendChild(br);
    var br = document.createElement('br');
    form.appendChild(br);
    */
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


   //end
   
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
    //opt1 
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
    //content of group 1

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
    ///opt2

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
    //content group 2

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
    //opt3
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
    //var folder = document.getElementById("folder");
    //var iso = document.getElementById("iso");
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
    //createVirtualDisk(name.value, sizedisk.value, folderdisk.value);
    //addStorageController(newUUID, 'on')
    
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
    var buttonUSB = document.createElement('button');
    buttonUSB.textContent = "USB";
    buttonUSB.setAttribute('class', 'action-buttons');
    buttonUSB.onclick = function() {
        alert(UUID);
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
    li.append(buttonUSB);
    li.append(buttonFolders);

    ul.appendChild(li);

    var li = document.createElement('li');
    var div = document.createElement('div');
    div.id = "settingsInfo";
    li.appendChild(div);
    ul.appendChild(li);
}

function showGeneral(UUID){
    var div = document.getElementById('settingsInfo');
    div.innerHTML = '';

    var form = document.createElement('form');
    cockpit.spawn(['VBoxManage', 'showvminfo', UUID, "--machinereadable"]).done(function(data) {
        var vmList = data.split('\n\n');
        vmList.forEach(function(vm) {
            if(vm){

                //general
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
        // Display an error message if retrieving virtual machine details fails
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

                //system
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
                    }    var div = document.getElementById('settingsInfo');
                    div.innerHTML = ''; // Clear the previous content
                
                    // Create a form
                    var form = document.createElement('form');
                
                    // Create an input field for the command
                    var input = document.createElement('input');
                    input.type = 'text';
                    input.placeholder = 'Type your command here';
                    input.id = 'commandInput'; // ID for later access
                    form.appendChild(input);
                
                    // Create a button to execute the command
                    var button = document.createElement('button');
                    button.type = 'button'; // Type 'button' to avoid form submission
                    button.textContent = 'Run Command';
                    
                    // Add a click event to the button
                    button.addEventListener('click', function() {
                        var command = input.value; // Get the command from the input field
                        if (command) {
                            // Execute the command using cockpit.spawn
                            cockpit.spawn(['bash', '-c', command]).then(function(output) {
                                console.log('Command output:', output); // Display the output in the console
                            }).catch(function(error) {
                                console.error('Error executing the command:', error); // Display the error in the console
                            });
                        } else {
                            console.warn('Please type a command.'); // Warning if the field is empty
                        }
                    });
                
                    form.appendChild(button);
                
                    // Create a button to open the file manager
                    var dirButton = document.createElement('button');
                    dirButton.type = 'button'; // Type 'button' to avoid form submission
                    dirButton.textContent = 'Browse Directories';
                
                    // Add a click event to the directory button
                    dirButton.addEventListener('click', function() {
                        navigateDirectories('/'); // Start navigation from the root
                    });
                
                    form.appendChild(dirButton);
                    div.appendChild(form); // Add the form to the div
                };
                form.appendChild(buttonCancel);
                form.appendChild(buttonSave);
            }
        });
    }).fail(function(error) {
        // Display an error message if retrieving virtual machine details fails
        var ul = document.getElementById('vmList');
        ul.innerHTML = '<li class="vm-item">Error retrieving virtual machine information: ' + error + '</li>';
    });
    div.appendChild(form);
}
function addController(vmId) {
    var detailsContainer = document.querySelector('.details-container');
    detailsContainer.innerHTML = ''; // Clear the previous content

    // Create the form
    var form = document.createElement('form');
    form.className = 'add-controller-form';

    // Field for the controller name
    var nameLabel = document.createElement('label');
    nameLabel.textContent = 'Controller Name:';
    var nameInput = document.createElement('input');
    nameInput.type = 'text';
    nameInput.id = 'controllerName';
    nameInput.required = true; // Make the field mandatory
    form.appendChild(nameLabel);
    form.appendChild(nameInput);
    form.appendChild(document.createElement('br'));

    // Field to select the controller type
    var typeLabel = document.createElement('label');
    typeLabel.textContent = 'Controller Type:';
    var typeSelect = document.createElement('select');
    typeSelect.id = 'controllerType';
    
    // Add options to the select
    var types = ['sata', 'ide', 'scsi', 'usb', 'pci'];
    types.forEach(function(type) {
        var option = document.createElement('option');
        option.value = type;
        option.textContent = type.charAt(0).toUpperCase() + type.slice(1); // Capitalize the first letter
        typeSelect.appendChild(option);
    });
    
    form.appendChild(typeLabel);
    form.appendChild(typeSelect);
    form.appendChild(document.createElement('br'));

    // Field to select whether it is bootable
    var bootableLabel = document.createElement('label');
    bootableLabel.textContent = 'Bootable:';
    var bootableSelect = document.createElement('select');
    bootableSelect.id = 'bootableOption';
    
    // Add options to the select
    var bootableOptions = ['on', 'off'];
    bootableOptions.forEach(function(option) {
        var bootOption = document.createElement('option');
        bootOption.value = option;
        bootOption.textContent = option.charAt(0).toUpperCase() + option.slice(1); // Capitalize the first letter
        bootableSelect.appendChild(bootOption);
    });
    
    form.appendChild(bootableLabel);
    form.appendChild(bootableSelect);
    form.appendChild(document.createElement('br'));

    // Save button
    var saveButton = document.createElement('button');
    saveButton.type = 'button'; // Do not submit the form
    saveButton.textContent = 'Save';
    saveButton.onclick = function() {
        var controllerName = nameInput.value;
        var controllerType = typeSelect.value;
        var bootable = bootableSelect.value;

        // Command to execute
        var command = `VBoxManage storagectl ${vmId} --name ${controllerName} --add ${controllerType} --bootable ${bootable}`;
        console.log("Command to be executed:", command);
        
        // Execute the command using cockpit.spawn
        cockpit.spawn(command.split(' ')).done(function() {
            alert("Controller added successfully: " + controllerName);
            showStorage(vmId);
            // Here you can add logic to update the interface if needed
        }).fail(function(error) {
            alert("Error adding controller: " + error);
            console.error("Error:", error);
        });
    };
    
    form.appendChild(saveButton);
    detailsContainer.appendChild(form);
}

function removeController(vmId, controllerName) {
    // Confirmation before removing
    if (confirm("Are you sure you want to remove the controller: " + controllerName + "?")) {
        // Command to execute
        var command = `VBoxManage storagectl ${vmId} --name ${controllerName} --remove`;
        console.log("Command to be executed:", command);
        
        // Try to split the command more robustly
        var commandArray = command.split(/\s+/);
        console.log("Command array:", commandArray);
        
        cockpit.spawn(commandArray).done(function(data) {
            alert("Controller removed successfully: " + controllerName);
            showStorage(vmId); // Refresh the display after removal
        }).fail(function(error) {
            alert("Error removing controller: " + error.message);
            console.error("Error:", error);
            console.error("Command output:", error.data); // Capture the command output
        });
    }
}



function showStorage(UUID) {
    var div = document.getElementById('settingsInfo');
    div.innerHTML = ''; // Clear the previous content

    // Create a flexible container
    var container = document.createElement('div');
    container.className = 'main-container';

    // Container for controllers
    var storageContainer = document.createElement('div');
    storageContainer.className = 'storage-container';

    // Container for details
    var detailsContainer = document.createElement('div');
    detailsContainer.className = 'details-container';

    // Add the containers to the main container
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

                // Buttons to add and remove disks
                var addButton = document.createElement('button');
                addButton.textContent = '+';
                addButton.onclick = function() {
                    // Logic to add a new disk
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
                    var fileName = line.split('/').pop(); // File name
                    var filePath = line.split('=')[1].trim().replace(/\"/g, ''); // Full file path

                    fileItem.textContent = fileName;

                    // Add a click event to show item details
                    fileItem.onclick = function() {
                        detailsContainer.innerHTML = "<strong>Item Details:</strong><br>" +
                            "Name: " + fileName + "<br>" +
                            "Path: <input type='text' id='diskPath' value='" + filePath + "' style='width: 100%;'/>" +
                            "<br><button id='saveButton'>Save</button>";

                        // If it is a .vdi file, show size
                        if (fileName.endsWith('.vdi')) {
                            // Here you can add logic to get the disk size
                            var currentSize = "10GB"; // Example current size
                            var virtualSize = "20GB"; // Example virtual size
                            detailsContainer.innerHTML += "<br>Current Size: " + currentSize + "<br>Virtual Size: " + virtualSize;
                        }

                        // Add a click event to the Save button
                        document.getElementById('saveButton').onclick = function() {
                            var newPath = document.getElementById('diskPath').value;
                            // Here you can add logic to save the new path
                            console.log("New path saved:", newPath);
                            alert("Path saved: " + newPath); // Example feedback
                        };
                    };

                    currentController.appendChild(fileItem);
                } else if (line.endsWith('none"')) {
                    // If there is no disk, you can add a message or simply ignore it
                }
            }
        });

        if (currentController) {
            storageContainer.appendChild(currentController);
        }

        // Always display the button to add a controller
        var addControllerButton = document.createElement('button');
        addControllerButton.textContent = 'Add Controller';
        addControllerButton.onclick = function() {
            addController(UUID); // Calls the function with the UUID when the button is clicked
        };
        storageContainer.appendChild(addControllerButton);

            });
}

function addDisk(UUID, storageControllerName) {
    var detailsContainer = document.querySelector('.details-container');
    detailsContainer.innerHTML = ''; // Clear the previous content

    // Create the form
    var form = document.createElement('form');
    form.className = 'add-disk-form';

    // Disk path field
    var diskLabel = document.createElement('label');
    diskLabel.textContent = 'Disk Path (.iso or .vdi):';
    var diskInput = document.createElement('input');
    diskInput.type = 'text';
    diskInput.id = 'diskPath';
    diskInput.required = true; // Make the field mandatory
    form.appendChild(diskLabel);
    form.appendChild(diskInput);
    form.appendChild(document.createElement('br'));
    // Port field
    var portLabel = document.createElement('label');
    portLabel.textContent = 'Port:';
    var portSelect = document.createElement('select');
    portSelect.id = 'diskPort';
    
    // Add options to the select
    for (var i = 0; i < 4; i++) {
        var option = document.createElement('option');
        option.value = i;
        option.textContent = i; // Port as a number
        portSelect.appendChild(option);
    }
    
    form.appendChild(portLabel);
    form.appendChild(portSelect);
    form.appendChild(document.createElement('br'));

    // Device field
    var deviceLabel = document.createElement('label');
    deviceLabel.textContent = 'Device:';
    var deviceSelect = document.createElement('select');
    deviceSelect.id = 'diskDevice';
    
    // Add options to the select
    var devices = ['0', '1']; // Example devices
    devices.forEach(function(device) {
        var option = document.createElement('option');
        option.value = device;
        option.textContent = device; // Device as a number
        deviceSelect.appendChild(option);
    });
    
    form.appendChild(deviceLabel);
    form.appendChild(deviceSelect);
    form.appendChild(document.createElement('br'));
    // Disk type field
    var typeLabel = document.createElement('label');
    typeLabel.textContent = 'Disk Type:';
    var typeSelect = document.createElement('select');
    typeSelect.id = 'diskType';
    
    // Add options to the select
    var types = ['dvddrive', 'hdd'];
    types.forEach(function(type) {
        var option = document.createElement('option');
        option.value = type;
        option.textContent = type.charAt(0).toUpperCase() + type.slice(1); // Capitalize the first letter
        typeSelect.appendChild(option);
    });
    
    form.appendChild(typeLabel);
    form.appendChild(typeSelect);
    form.appendChild(document.createElement('br'));

    // Disk size field (HDD only)
    var sizeLabel = document.createElement('label');
    sizeLabel.textContent = 'Disk Size (MB):';
    var sizeInput = document.createElement('input');
    sizeInput.type = 'number';
    sizeInput.id = 'diskSize';
    sizeInput.required = true; // Make the field mandatory
    form.appendChild(sizeLabel);
    form.appendChild(sizeInput);
    form.appendChild(document.createElement('br'));
    // Save button
    var saveButton = document.createElement('button');
    saveButton.type = 'button'; // Do not submit the form
    saveButton.textContent = 'Save';
    saveButton.onclick = function() {
        var diskPath = diskInput.value;
        var diskPort = portSelect.value;
        var diskDevice = deviceSelect.value;
        var diskType = typeSelect.value;
        var diskSize = sizeInput.value; // Disk size

        if (diskType === 'dvddrive') {
            // Command for dvddrive
            var command = `VBoxManage storageattach ${UUID} --storagectl ${storageControllerName} --port ${diskPort} --device ${diskDevice} --type dvddrive --medium ${diskPath}`;
            console.log("Command to be executed:", command);
            
            // Execute the command
            // Execute the command using cockpit.spawn
            cockpit.spawn(command.split(' ')).done(function() {
                alert("Disk added successfully: " + diskPath);
                showStorage(UUID);
            }).fail(function(error) {
                alert("Error adding disk: " + error.message);
                console.error("Error:", error);
                console.error("Command output:", error.data); // Capture the command output
            });
        } else if (diskType === 'hdd') {
            // Command to create the HDD disk
            var createCommand = `VBoxManage createmedium disk --filename "${diskPath}" --size ${diskSize}`;
            console.log("Command to create HDD disk:", createCommand);
            
            // Execute the command to create the disk
            cockpit.spawn(createCommand.split(' ')).done(function() {
                // Command to attach the HDD disk
                var attachCommand = `VBoxManage storageattach ${UUID} --storagectl ${storageControllerName} --port ${diskPort} --device ${diskDevice} --type hdd --medium "${diskPath}"`;
                console.log("Command to be executed:", attachCommand);
                
                // Execute the command to attach the disk
                cockpit.spawn(attachCommand.split(' ')).done(function() {
                    alert("HDD disk added successfully: " + diskPath);
                    showStorage(UUID);
                }).fail(function(error) {
                    alert("Error attaching HDD disk: " + error.message);
                    console.error("Error:", error);
                    console.error("Command output:", error.data); // Capture the command output
                });
            }).fail(function(error) {
                alert("Error creating HDD disk: " + error.message);
                console.error("Error:", error);
                console.error("Command output:", error.data); // Capture the command output
            });
        }
    };
    
    form.appendChild(saveButton);
    detailsContainer.appendChild(form);
}


function showNetworks(){
    var div = document.getElementById('settingsInfo');
    div.innerHTML = ''; // Clear the previous content

    // Create a form
    var form = document.createElement('form');

    // Create an input field for the command
    var input = document.createElement('input');
    input.type = 'text';
    input.placeholder = 'Type your command here';
    input.id = 'commandInput'; // ID for later access
    form.appendChild(input);

    // Create a button to execute the command
    var button = document.createElement('button');
    button.type = 'button'; // Type 'button' to avoid form submission
    button.textContent = 'Run Command';
    
    // Add a click event to the button
    button.addEventListener('click', function() {
        var command = input.value; // Get the command from the input field
        if (command) {
            // Execute the command using cockpit.spawn
            cockpit.spawn(['bash', '-c', command]).then(function(output) {
                console.log('Command output:', output); // Display the output in the console
            }).catch(function(error) {
                console.error('Error executing the command:', error); // Display the error in the console
            });
        } else {
            console.warn('Please type a command.'); // Warning if the field is empty
        }
    });

    form.appendChild(button);

    // Create a button to open the file manager
    var dirButton = document.createElement('button');
    dirButton.type = 'button'; // Type 'button' to avoid form submission
    dirButton.textContent = 'Browse Directories';

    // Add a click event to the directory button
    dirButton.addEventListener('click', function() {
        navigateDirectories('/'); // Start navigation from the root
    });

    form.appendChild(dirButton);
    div.appendChild(form); // Add the form to the div
}


// Function to navigate directories
function navigateDirectories(path) {
    // Run the command to list directories and files
    cockpit.spawn(['bash', '-c', `ls -l "${path}"`]).then(function(output) {
        var div = document.getElementById('settingsInfo');
        div.innerHTML = ''; // Clear the previous content

        // Display the list of files and directories
        var files = output.split('\n');
        var list = document.createElement('ul');

        files.forEach(function(file) {
            if (file) {
                var listItem = document.createElement('li');
                listItem.textContent = file;

                // Add a click event to navigate into directories
                listItem.addEventListener('click', function() {
                    var parts = file.split(/\s+/);
                    var dirName = parts[parts.length - 1]; // Get the directory name
                    navigateDirectories(`${path}/${dirName}`); // Navigate to the selected directory
                });

                list.appendChild(listItem);
            }
        });

        // Add a button to go back to the parent directory
        var backButton = document.createElement('button');
        backButton.textContent = 'Back';
        backButton.addEventListener('click', function() {
            var parentPath = path.split('/').slice(0, -1).join('/') || '/';
            navigateDirectories(parentPath); // Return to the parent directory
        });

        div.appendChild(backButton);
        div.appendChild(list); // Add the list of files/directories to the div
    }).catch(function(error) {
        console.error('Error listing directories:', error); // Display the error in the console
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
                    //ShowMachineClick(UUID);
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

// Function to extract information from a specific virtual machine
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
    // Check if the state is "running"
    if (resultado.estado === "running") {
        // Add the class to the <li>
        li.classList.add('vm-item-running');
    }else{
        li.classList.remove('vm-item-running');
    }
}

function dividirEstado(s) {
    var index = s.indexOf('(since)');
    var estado = "";

    if (index !== -1) {
        estado = s.substring(0, index).trim(); // Get the state, removing leading and trailing whitespace
    } else {
        estado = s.trim(); // If "(since)" is not found, assume the entire string is the state
    }

    // Remove any other text that may be present in the state, leaving only the state itself
    estado = estado.split(' ')[0];

    return { estado: estado };
}
// Call the function when the page loads
window.onload = listarMaquinasVirtuais;
