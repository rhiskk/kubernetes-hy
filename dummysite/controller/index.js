const k8s = require('@kubernetes/client-node');
const mustache = require('mustache');
const request = require('request');
const JSONStream = require('json-stream');
const fs = require('fs').promises;
const kc = new k8s.KubeConfig();

process.env.NODE_ENV === 'development' ? kc.loadFromDefault() : kc.loadFromCluster();

const opts = {};
kc.applyToRequest(opts);

const client = kc.makeApiClient(k8s.CoreV1Api);

const sendRequestToApi = async (api, method = 'get', options = {}) => new Promise((resolve, reject) => request[method](`${kc.getCurrentCluster().server}${api}`, { ...opts, ...options, headers: { ...options.headers, ...opts.headers } }, (err, res) => err ? reject(err) : resolve(JSON.parse(res.body))));

const fieldsFromDummy = (object) => ({
  dummysite_name: object.metadata.name,
  deployment_name: `${object.metadata.name}-dep`,
  service_name: `${object.metadata.name}-svc`,
  ingress_name: `${object.metadata.name}-ing`,
  namespace: object.metadata.namespace,
  image: object.spec.image,
  website_url: object.spec.website_url
});

const getDeploymentYAML = async (fields) => {
  const deploymentTemplate = await fs.readFile("deployment.mustache", "utf-8");
  return mustache.render(deploymentTemplate, fields);
};

const deploymentForDummyAlreadyExists = async (fields) => {
  const { deployment_name, namespace } = fields;
  const { items } = await sendRequestToApi(`/apis/apps/v1/namespaces/${namespace}/deployments`);
  return items.find(item => item.metadata.name === deployment_name);
};

const createDeployment = async (fields) => {
  if (await deploymentForDummyAlreadyExists(fields)) return;
  console.log('Scheduling new deployment for dummysite with url', fields.website_url, 'to namespace', fields.namespace);

  const yaml = await getDeploymentYAML(fields);
  return sendRequestToApi(`/apis/apps/v1/namespaces/${fields.namespace}/deployments`, 'post', {
    headers: {
      'Content-Type': 'application/yaml'
    },
    body: yaml
  });
};

const getServiceYAML = async (fields) => {
  const serviceTemplate = await fs.readFile("service.mustache", "utf-8");
  return mustache.render(serviceTemplate, fields);
};

const serviceForDummyAlreadyExists = async (fields) => {
  const { service_name, namespace } = fields;
  const { items } = await sendRequestToApi(`/api/v1/namespaces/${namespace}/services`);

  return items.find(item => item.metadata.name === service_name);
};

const createService = async (fields) => {
  if (await serviceForDummyAlreadyExists(fields)) return;
  console.log('Scheduling new service', fields.service_name, 'for dummysite to namespace', fields.namespace);

  const yaml = await getServiceYAML(fields);
  return sendRequestToApi(`/api/v1/namespaces/${fields.namespace}/services`, 'post', {
    headers: {
      'Content-Type': 'application/yaml'
    },
    body: yaml
  });
};

const getIngressYAML = async (fields) => {
  const serviceTemplate = await fs.readFile("ingress.mustache", "utf-8");
  return mustache.render(serviceTemplate, fields);
};

const ingressForDummyAlreadyExists = async (fields) => {
  const { ingress_name, namespace } = fields;
  const { items } = await sendRequestToApi(`/apis/networking.k8s.io/v1/namespaces/${namespace}/ingresses`);

  return items.find(item => item.metadata.name === ingress_name);
};

const createIngress = async (fields) => {
  if (await ingressForDummyAlreadyExists(fields)) return;
  console.log('Scheduling new ingress', fields.ingress_name, 'for dummysite to namespace', fields.namespace);

  const yaml = await getIngressYAML(fields);
  return sendRequestToApi(`/apis/networking.k8s.io/v1/namespaces/${fields.namespace}/ingresses`, 'post', {
    headers: {
      'Content-Type': 'application/yaml'
    },
    body: yaml
  });
};

const cleanUp = async (fields) => {
  const { deployment_name, service_name, ingress_name, namespace } = fields;
  console.log('Cleaning up dummysite', fields.dummysite_name, 'in namespace', fields.namespace);
  await sendRequestToApi(`/apis/apps/v1/namespaces/${namespace}/deployments/${deployment_name}`, 'delete');
  await sendRequestToApi(`/api/v1/namespaces/${namespace}/services/${service_name}`, 'delete');
  await sendRequestToApi(`/apis/networking.k8s.io/v1/namespaces/${namespace}/ingresses/${ingress_name}`, 'delete');
};

const maintainStatus = async () => {
  (await client.listPodForAllNamespaces()).body;

  /**
   * Watch Countdowns
   */

  const dummysite_stream = new JSONStream();

  dummysite_stream.on('data', async ({ type, object }) => {
    const fields = fieldsFromDummy(object);

    if (type === 'ADDED') {
      await createDeployment(fields);
      await createService(fields);
      await createIngress(fields);
    }
    if (type === 'DELETED') {
      await cleanUp(fields);
    }
  });

  request.get(`${kc.getCurrentCluster().server}/apis/stable.dwk/v1/dummysites?watch=true`, opts).pipe(dummysite_stream);
};

maintainStatus();