const _ = require('lodash');
const { h } = require('../utils/format');
const { formatNumber } = require('../utils/formatNumber');

const getLanguages = function(item) {
  if (item.github_data && item.github_data.languages) {
    const total = _.sum(item.github_data.languages.map( (x) => x.value));
    const matching = item.github_data.languages.filter( (x) => x.value > total * 0.3).map( (x) => x.name);
    return matching.join(', ');
  } else {
    return '';
  }
}

const getDate = function(date) {
  if (!date) {
    return '';
  }
  return new Date(date).toISOString().substring(0, 10);
}

module.exports.render = function({items}) {

  const projects = items.filter( (x) => !!x.relation && x.relation !== 'member');
  const categories = _.uniq(projects.map( (x) => x.path.split(' / ')[0]));
  const categoriesCount = {};
  const categoryItems = {};
  const subcategories = {};
  for (let k of categories) {
    categoriesCount[k] = projects.filter( (x) => x.path.split(' / ')[0] === k).length;
    categoryItems[k] = projects.filter( (x) => x.path.split(' / ')[0] === k).map( (x) => projects.indexOf(x));
    const arr = _.uniq(projects.filter( (x) => x.path.split(' / ')[0] === k).map( (x) => x.path.split(' / ')[1]));
    for (let subcategory of arr) {
      categoryItems[k + ':' + subcategory] = projects.filter( (x) => x.path === k + ' / ' + subcategory).map( (x) => projects.indexOf(x));
    }
    subcategories[k] = arr;
  }
  console.info(categoryItems);




  const columnWidth = 250;

  return `
    <style>
      .category {
        font-size: 24px;
        font-weight: bold;
      }

      .categories {
        display: inline-block;
        margin: 5px;
        font-size: 14px;
      }

      .subcategories {
        display: inline-block;
        margin: 5px;
        font-size: 14px;
      }

      table {
        width: ${columnWidth * projects.length}px;
        table-layout: fixed;
        border-collapse: separate;
        border-spacing: 0;
        border-top: 1px solid grey;
      }

      td,
      th {
        width: ${columnWidth}px;
        margin: 0;
        border: 1px solid grey;
        border-top-width: 0px;
        height: 50px;
        padding: 0 3px;
      }

      .table-wrapper {
        width: calc(100% - 150px);
        overflow-x: scroll;
        margin-left: 150px;
        overflow-y: visible;
        padding: 0;
      }

      .sticky {
        position: absolute;
        width: 150px;
        left: 0;
        top: auto;
        border-top-width: 1px;
        /*only relevant for first row*/
        margin-top: -1px;
        /*compensate for top border*/
      }

    </style>
    <h1>CNCF Project Summary Table (${projects.length})</h1>


    <div class="categories">
      <select>
        <option value="">All: ${projects.length}</option>
        ${categories.map( (name) => `<option value="${name}">${name}: ${categoriesCount[name]}</option>`).join('')}
      </select>
    </div>

    <div class="subcategories" style="display: none">
      <select></select>
    </div>


    <div class="table-wrapper">
    <table>
      <tr class="landscape">
        <td class="sticky">
          Project
        </td>
        ${projects.map( (project, index) => `
          <td data-project-index="${index}">${h(project.name)}</td>
        `).join('')}
      </tr>
      <tr class="landscape">
        <td class="sticky">
           Description
        </td>
          ${projects.map( (project) => `
            <td>${h((project.github_data || project)['description'])}</td>
          `).join('')}
      </tr>
      <tr class="landscape">
        <td class="sticky">
           Maturity
        </td>
          ${projects.map( (project) => `
            <td>${h(project.relation)}</td>
          `).join('')}
      </tr>
      <tr class="landscape">
        <td class="sticky">
           Personas
        </td>
          ${projects.map( (project) => `
            <td>${h((project.extra || {})['summary_personas']) || '&nbsp;'}</td>
          `).join('')}
      </tr>
      <tr>
        <td class="sticky">
           Tags
        </td>
          ${projects.map( (project) => `
            <td>${h((project.extra || {})['summary_tags'] || '').split(',').map( (tag) => `<div>- ${tag.trim()}</div>`).join('') }</td>
          `).join('')}
      </tr>
      <tr>
        <td class="sticky">
           Use Case
        </td>
          ${projects.map( (project) => `
            <td>${h((project.extra || {})['summary_use_case']) || '&nbsp;'}</td>
          `).join('')}
      </tr>
      <tr>
        <td class="sticky">
           Business Use
        </td>
          ${projects.map( (project) => `
            <td>${h((project.extra || {})['summary_business_use_case']) || '&nbsp;'}</td>
          `).join('')}
      </tr>
      <tr class="landscape">
        <td class="sticky">
           Languages
        </td>
          ${projects.map( (project) => `
            <td>${h(getLanguages(project))}</td>
          `).join('')}
      </tr>
      <tr class="landscape">
        <td class="sticky">
           First Commit
        </td>
          ${projects.map( (project) => `
            <td>${h(getDate((project.github_start_commit_data || {}).start_date))}</td>
          `).join('')}
      </tr>
      <tr class="landscape">
        <td class="sticky">
           Last Commit
        </td>
          ${projects.map( (project) => `
            <td>${h(getDate((project.github_data || {}).latest_commit_date))}</td>
          `).join('')}
      </tr>
      <tr class="">
        <td class="sticky">
           Release Cadence
        </td>
          ${projects.map( (project) => `
            <td>${h((project.extra || {})['summary_release_rate']) || '&nbsp;'}</td>
          `).join('')}
      </tr>
      <tr class="landscape">
        <td class="sticky">
           Github Stars
        </td>
          ${projects.map( (project) => `
            <td>${h(formatNumber((project.github_data || {}).stars))}</td>
          `).join('')}
      </tr>
      <tr class="">
        <td class="sticky">
           Integrations
        </td>
          ${projects.map( (project) => `
            <td>${h((project.extra || {})['summary_integrations']) || '&nbsp;'}</td>
          `).join('')}
      </tr>
      <tr class="landscape">
        <td class="sticky">
           Website
        </td>
          ${projects.map( (project) => `
            <td><a href="${h((project.homepage_url))}" target="_blank">${h(project.homepage_url)}</a></td>
          `).join('')}
      </tr>
      <tr class="landscape">
        <td class="sticky">
           Github
        </td>
          ${projects.map( (project) => project.repo_url ? `
            <td><a href="${h(project.repo_url)}" target="_blank">${h(project.repo_url)}</a></td>
          `: '<td>&nbsp;</td>').join('')}
      </tr>
      <tr class="landscape">
        <td class="sticky">
           Youtube video
        </td>
          ${projects.map( (project) => project.extra && project.extra.summary_intro_url ? `
            <td><a href="${h(project.extra.summary_intro_url)}" target="_blank">${h(project.extra.summary_intro_url)}</a></td>
          `: '<td>&nbsp;</td>').join('')}
      </tr>
    </table>
    </div>
    <script>
      window.App = {
        totalCount: ${projects.length},
        categories: ${JSON.stringify(categories)},
        categoryItems: ${JSON.stringify(categoryItems)},
        subcategories: ${JSON.stringify(subcategories)}
      };
      document.querySelector('.categories select').addEventListener('change', function(e) {
        const selectedOption = Array.from(document.querySelectorAll('.categories option')).find( (x) => x.selected);
        const categoryId = selectedOption.value;
        if (!categoryId) {
          document.querySelector('table').style.width = '';
          document.querySelector('.subcategories').style.display = 'none';
        } else {
          document.querySelector('.subcategories').style.display = '';
          const newWidth = ${columnWidth} * App.categoryItems[categoryId].length;
          document.querySelector('table').style.width = newWidth + 'px';

          const subcategories = window.App.subcategories[categoryId];
          const baseMarkup = '<option value="">All</option>';
          const markup = subcategories.map( (s) => '<option value="' + s + '">' + s + '</option>').join('');
          document.querySelector('.subcategories select').innerHTML = baseMarkup + markup;

        }

        for (let tr of [...document.querySelectorAll('tr')]) {
          let index = 0;
          for (let td of [...tr.querySelectorAll('td')].slice(1)) {
            const isVisible = categoryId ? App.categoryItems[categoryId].includes(index) : true;
            td.style.display = isVisible ? '' : 'none';
            index += 1;
          }
        }
      });

      document.querySelector('.subcategories select').addEventListener('change', function(e) {
        const categoryId = Array.from(document.querySelectorAll('.categories option')).find( (x) => x.selected).value;
        const subcategoryId = Array.from(document.querySelectorAll('.subcategories option')).find( (x) => x.selected).value;

        let key = subcategoryId ? (categoryId + ':' + subcategoryId) : categoryId;

        const newWidth = ${columnWidth} * App.categoryItems[key].length;
        document.querySelector('table').style.width = newWidth + 'px';

        for (let tr of [...document.querySelectorAll('tr')]) {
          let index = 0;
          for (let td of [...tr.querySelectorAll('td')].slice(1)) {
            const isVisible = App.categoryItems[key].includes(index);
            td.style.display = isVisible ? '' : 'none';
            index += 1;
          }
        }
      });
    </script>

  `
}
