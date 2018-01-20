const source = require('js-yaml').safeLoad(require('fs').readFileSync('src/data.yml'));
const traverse = require('traverse');
const _ = require('lodash');
import saneName from '../src/utils/saneName';


const items = [];
const tree = traverse(source);
tree.map(function(node) {
  if (node && node.item === null) {
    const parts = this.parents.filter(function(p) {
      return p.node.category === null || p.node.subcategory === null;
    }).map(function(p) {
      return p.node.name;
    });
    items.push({...node,
      cncfHostedProject: node.cncf_hosted_project,
      path: parts.join(' / '),
      landscape: parts[0],
      stars: _.random(12000),
      certifiedKubernetes: _.sample(['platform', 'distribution', 'platformOrDistribution', 'notCertified']),
      license: _.sample(['gpl-v2', 'gpl-v3', 'mit', 'apache', 'commercial']),
      marketCap: _.random(1000),
      vcFunder: _.sample(['ycombinator', 'other1', 'other2', 'other3']),
      headquaters: _.sample(['NY', 'San Francisco', 'West Palm Beacch'])
    });
  }
});
const itemsWithExtraFields = items.map(function(item) {
  delete item.cncf_hosted_project;
  return {
    ...item,
    starsCategory: (item.stars < 100 ? '1to100' : item.stars < 1000 ? '100to1000' : item.stars < 10000 ? '1000to10000' : 'over10000'),
    marketCapCategory: (item.marketCap < 1 ? '<1M' : item.marketCap < 10 ? '1M-10M' : item.marketCap < 100 ? '10M-100M' : item.marketCap < 1000 ? '100M-1000M': '1000M+'),
    logo: `logo-${saneName(item.name)}`
  }
});
require('fs').writeFileSync('src/data.json', JSON.stringify(itemsWithExtraFields, null, 2));
