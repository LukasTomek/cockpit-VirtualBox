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
  if (typeof DOMParser !== 'undefined') {
    return {
      parseFromString: (str) => new DOMParser().parseFromString(str, 'application/xml')
    };
  }
  try {
    // Node fallback: install xmldom (npm install xmldom)
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
    const rdNode = remoteDisplayNodes[0];
    const enabled = rdNode.getAttribute('enabled') === 'true';
    const vrdePropsNodes = rdNode.getElementsByTagName('VRDEProperties');
    let parsedProps = {};
    if (vrdePropsNodes && vrdePropsNodes.length > 0) {
      parsedProps = parseProperties(vrdePropsNodes[0]);
    }

    const remoteDisplay = {
      enabled,
      rawProperties: parsedProps,
      securityMethod: parsedProps['Security/Method'] || null,
      serverCertificatePath: parsedProps['Security/ServerCertificate'] || null,
      serverPrivateKeyPath: parsedProps['Security/ServerPrivateKey'] || null,
      vncPasswordPresent: !!parsedProps['VNCPassword'],
      vncPasswordMasked: parsedProps['VNCPassword'] ? maskValue(parsedProps['VNCPassword']) : null
    };

    machine.remoteDisplay = remoteDisplay;
  }

  // USB: controllers and DeviceFilters
  const usbNodes = machineNode.getElementsByTagName('USB');
  if (usbNodes && usbNodes.length > 0) {
    const usbNode = usbNodes[0];

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
          port: text
