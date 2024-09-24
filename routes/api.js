'use strict';
function generateUUID() {
  let d = new Date().getTime();
  const uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = (d + Math.random()*16)%16 | 0;
    d = Math.floor(d/16);
    return (c === 'x'? r : (r&0x3|0x8)).toString(16);
  });
  return uuid.replace(/-/g, '');
}
function nowDateStr(){
  const date = new Date();
const year = date.getFullYear();
const month = String(date.getMonth() + 1).padStart(2, '0');
const day = String(date.getDate()).padStart(2, '0');
const hours = String(date.getHours()).padStart(2, '0');
const minutes = String(date.getMinutes()).padStart(2, '0');
const seconds = String(date.getSeconds()).padStart(2, '0');
const milliseconds = String(date.getMilliseconds()).padStart(3, '0');

const formattedDate = `${year}-${month}-${day}T${hours}:${minutes}:${seconds}.${milliseconds}Z`;
return formattedDate;
}

function checkRequiredFields(body,fieldNames) {
  let check = null;
  for (const fieldName of fieldNames) {
    if (!body.hasOwnProperty(fieldName)) {
      return { error: 'required field(s) missing' };
    }
    if (typeof body[fieldName]!== 'string' || body[fieldName].trim().length === 0) {
      return { error: 'required field(s) missing' };
    }
  }
  return check;
}

module.exports = function (app) {

  let projects = new Map();

  app.route('/api/issues/:project')
  
    .get(function (req, res){
      const project = req.params.project;
      const query = req.query;
      if(projects.has(project)){
        let issues = projects.get(project);
        issues = issues.filter(issue => {
          const queryKeys = Object.keys(query);
          return queryKeys.every(key => issue[key] && issue[key].toString() === query[key]);
        });
        res.json(issues);
      }
      res.json({});
    })
    
    .post(function (req, res){
      let project = req.params.project;
      let nowTime = nowDateStr();
      const requiredFields = ['issue_title', 'issue_text', 'created_by'];
      const check = checkRequiredFields(req.body,requiredFields);
      if(!Object.is(check, null)){
        res.json(check);
      }
      const issue = {
        _id:generateUUID(),
        issue_title:req.body.issue_title,
        issue_text:req.body.issue_text,
        created_by:req.body.created_by,
        assigned_to:req.body.assigned_to?req.body.assigned_to:'',
        status_text:req.body.status_text?req.body.status_text:'',
        open:true,
        created_on:nowTime,
        updated_on:nowTime
      };
      if(projects.has(project)){
        let issues = projects.get(project);
        issues.push(issue);
      }else{
        projects.set(project,[issue]);
      }
      res.json(issue);
    })
    
    .put(function (req, res){
      const project = req.params.project;
      let result = {result:'successfully updated', '_id': '' };
      if(projects.has(project)){
        let issues = projects.get(project);
        if(!req.body._id) {
        res.json({error:'missing _id'});
        }
        const issue = issues.find(issue => issue._id === req.body._id);

        if(issue){
          const updateKeys = Object.keys(req.body);
          if(updateKeys.length === 1) {
            res.json({error:'no update field(s) sent',_id:req.body._id});
          }
          updateKeys.forEach(updateKey =>{
            issue[updateKey] = req.body[updateKey];
          });
          issue.updated_on = nowDateStr();
        }else{
          const updateKeys = Object.keys(req.body);
          if(updateKeys.length === 1) {
            res.json({error:'no update field(s) sent',_id:req.body._id});
          }else{
            res.json({error:'could not update',_id:req.body._id});
          }
        }
        result._id = issue._id;
        res.json(result);
      }
      res.json({});
    })
    
    .delete(function (req, res){
      let project = req.params.project;
      let result = {result:'successfully deleted', '_id': '' };
      if(projects.has(project)){
        let issues = projects.get(project);
        if(!req.body._id) {
          res.json({error:'missing _id'});
        }

        const issueIndex = issues.findIndex(issue => issue._id === req.body._id);

        if(issueIndex !== -1){
          issues.splice(issueIndex,1);
        }else{
          res.json({error:'could not delete',_id:req.body._id});
        }
        result._id = req.body._id;
        res.json(result);
      }
      res.json({});
    });
    
};
