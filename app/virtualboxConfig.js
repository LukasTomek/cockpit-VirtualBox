// Helper utilities to parse VirtualBox Machine XML and extract RemoteDisplay (VRDE) and USB info.
// Works in browser (DOMParser) and Node (xmldom fallback).
//
// Exports:
// - parseVirtualBoxMachineXml(xmlText) -> { name, uuid, remoteDisplay, usb }
// - maskValue(value) -> masked string (for logging)

function maskValue(value) {
  if (value == null) return null;
  const s = String(value);
  if (s.length <= 4) return '****';
  return s.slice(0, 2) + '****' + s.slice(-2);
}

function getDomParser() {
  // browser DOMParser
  if (typeof DOMParser !== 'undefined') {
    return {
      parseFromString: (str) => new DOMParser().parseFromString(str, 'application/xml')
    };
  }

  // Node fallback using xmldom (install: npm install xmldom)
  try {
    // eslint-disable-next-line global-require
    const { DOMParser } = require('xmldom');
    return { parseFromString: (str) => new DOMParser().parseFromString(str, 'application/xml') };
  } catch (err) {
    throw new Error('No DOMParser found. In Node please install xmldom: npm install xmldom');
  }
}

function textFromAttr(node, attrName) {
  if (!node) return null;
  const a = node.getAttribute(attrName);
  return a === null ? null : a;
}

// parse <Property name="..." value="..."/>
function parseProperties(propsNode) {
  const out = {};
  if (!propsNode) return out;
  const props = propsNode.getElementsByTagName('Property');
  for (let i = 0; i < props.length; i += 1) {
    const p = props[i];
    const name = p.getAttribute('name');
    const value = p.getAttribute('value');
    if (!name) continue;
    out[name] = value;
  }
  return out;
}

function parseVirtualBoxMachineXml(xmlText) {
  if (!xmlText) throw new Error('No XML provided');

  const parser = getDomParser();
  const xml = parser.parseFromString(xmlText, 'application/xml');

  const machineNode = xml.getElementsByTagName('Machine')[0];
  if (!machineNode) {
    throw new Error('No <Machine> node found in VirtualBox XML');
  }

  const machine = {
    name: textFromAttr(machineNode, 'name'),
    uuid: textFromAttr(machineNode, 'uuid'),
    ostype: textFromAttr(machineNode, 'OSType'),
    lastStateChange: textFromAttr(machineNode, 'lastStateChange'),
    remoteDisplay: null,
    usb: {
      controllers: [],
      filters: []
    }
  };

  // RemoteDisplay (VRDE)
  const remoteDisplayNodes = machineNode.getElementsByTagName('RemoteDisplay');
  if (remoteDisplayNodes && remoteDisplayNodes.length > 0) {
    // there may be one RemoteDisplay under Hardware, but guard for any
    const rdNode = remoteDisplayNodes[0];
    const enabled = rdNode.getAttribute('enabled') === 'true';
    const vrdePropsNodes = rdNode.getElementsByTagName('VRDEProperties');
    let parsedProps = {};
    if (vrdePropsNodes && vrdePropsNodes.length > 0) {
      parsedProps = parseProperties(vrdePropsNodes[0]);
    }

    // Map commonly-used properties to friendly keys
    const remoteDisplay = {
      enabled,
      rawProperties: parsedProps,
      // friendly fields:
      securityMethod: parsedProps['Security/Method'] || null,
      serverCertificatePath: parsedProps['Security/ServerCertificate'] || null,
      serverPrivateKeyPath: parsedProps['Security/ServerPrivateKey'] || null,
      vncPasswordPresent: !!parsedProps['VNCPassword'],
      vncPasswordMasked: parsedProps['VNCPassword'] ? maskValue(parsedProps['VNCPassword']) : null
    };

    // Don't return raw secret values (only masked). Keep rawProperties for debugging if needed,
    // but consumer should be careful with rawProperties since it may contain secrets.
    machine.remoteDisplay = remoteDisplay;
  }

  // USB: controllers and DeviceFilters
  const usbNodes = machineNode.getElementsByTagName('USB');
  if (usbNodes && usbNodes.length > 0) {
    const usbNode = usbNodes[0];

    // controllers
    const controllersNode = usbNode.getElementsByTagName('Controllers');
    if (controllersNode && controllersNode.length > 0) {
      const controllers = controllersNode[0].getElementsByTagName('Controller');
      for (let i = 0; i < controllers.length; i += 1) {
        const c = controllers[i];
        machine.usb.controllers.push({
          name: textFromAttr(c, 'name'),
          type: textFromAttr(c, 'type')
        });
      }
    }

    // device filters
    const filtersNode = usbNode.getElementsByTagName('DeviceFilters');
    if (filtersNode && filtersNode.length > 0) {
      const filters = filtersNode[0].getElementsByTagName('DeviceFilter');
      for (let i = 0; i < filters.length; i += 1) {
        const f = filters[i];
        machine.usb.filters.push({
          name: textFromAttr(f, 'name'),
          active: textFromAttr(f, 'active') === 'true',
          vendorId: textFromAttr(f, 'vendorId'),
          productId: textFromAttr(f, 'productId'),
          revision: textFromAttr(f, 'revision'),
          manufacturer: textFromAttr(f, 'manufacturer'),
          product: textFromAttr(f, 'product'),
          serialNumber: textFromAttr(f, 'serialNumber'),
          port: textFromAttr(f, 'port'),
          remote: textFromAttr(f, 'remote') === '1' || textFromAttr(f, 'remote') === 'true'
        });
      }
    }
  }

  return machine;
}

// Exports for CommonJS and ESM environments
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { parseVirtualBoxMachineXml, maskValue };
} else {
  // attach to window in browser
  window.parseVirtualBoxMachineXml = parseVirtualBoxMachineXml;
  window.maskValue = maskValue;
}