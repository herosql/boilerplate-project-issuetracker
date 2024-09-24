const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');

chai.use(chaiHttp);

suite('Functional Tests', function() {
    test('All fields create', function(done) {
        const issue = {
                issue_title: "Fix error in posting data",
                issue_text: "When we post data it has an error.",
                created_by: "Joe",
                assigned_to: "Joe",
                status_text: "In QA"
        };
        chai
        .request(server)
        .post('/api/issues/user')
        .send(issue)
        .end(function(err, res) {
          assert.equal(res.status, 200);
          assert.equal(res.body.issue_title,issue.issue_title);
          assert.equal(res.body.issue_text,issue.issue_text);
          assert.equal(res.body.created_by,issue.created_by);
          assert.equal(res.body.assigned_to,issue.assigned_to);
          assert.equal(res.body.status_text,issue.status_text);
          assert.isTrue(typeof res.body._id === 'string' && res.body._id.trim().length > 0);
          assert.isTrue(res.body.open);
          assert.isTrue(!isNaN(new Date(res.body.created_on).getTime()));
          assert.isTrue(!isNaN(new Date(res.body.updated_on).getTime()));
        });
        done();
    });

    test('without required fields create', function(done) {
        const issues = [{
            assigned_to: "Joe",
            status_text: "In QA"
        },{
            issue_title: "Fix error in posting data",
            assigned_to: "Joe",
            status_text: "In QA"
        },{
            issue_title: "Fix error in posting data",
            issue_text: "When we post data it has an error.",
            assigned_to: "Joe",
            status_text: "In QA"
        }];
        issues.forEach(issue=>{
            chai
            .request(server)
            .post('/api/issues/user')
            .send(issue)
            .end(function(err, res) {
                assert.equal(res.status, 200);
                try{
                    assert.equal(res.body.error,'required field(s) missing');
                }catch (error) {
                    console.error(`Error for item ${JSON.stringify(issue)}: ${error.message}`);
                    throw error;
                  }
            });
        });
        done();
    });

    test('Just required fields create', function(done) {
        const issue = {
                issue_title: "Fix error in posting data",
                issue_text: "When we post data it has an error.",
                created_by: "Joe",
        };
        chai
        .request(server)
        .post('/api/issues/user')
        .send(issue)
        .end(function(err, res) {
          assert.equal(res.status, 200);
          assert.equal(res.body.issue_title,issue.issue_title);
          assert.equal(res.body.issue_text,issue.issue_text);
          assert.equal(res.body.created_by,issue.created_by);
          assert.isTrue(typeof res.body._id === 'string' && res.body._id.trim().length > 0);
          assert.isTrue(res.body.open);
          assert.isTrue(!isNaN(new Date(res.body.created_on).getTime()));
          assert.isTrue(!isNaN(new Date(res.body.updated_on).getTime()));
        });
        done();
    });

    async function addIssue(project, issue) {
        const res = await chai.request(server).post(`/api/issues/${project}`).send(issue);
        assert.equal(res.status, 200);
        return res.body;
      }

    async function queryIssues(project){
        const res =  await chai
        .request(server)
        .get(`/api/issues/${project}`);
        assert.equal(res.status, 200);
        return res.body[0];
    }

    test('View issues on a project', async function() {
        const issues = [{
            issue_title: "Fix error in posting data",
            issue_text: "When we post data it has an error.",
            created_by: "Joe",
            assigned_to: "Joe",
            status_text: "In QA"
        },{
            issue_title: "Fix error in posting data 2",
            issue_text: "When we post data it has an error 2.",
            created_by: "Joe2",
            assigned_to: "Joe2",
            status_text: "In QA2"
        }];
        const project = 'data';
        for (const issue of issues) {
            await addIssue(project, issue);
          }
        chai
        .request(server)
        .get(`/api/issues/${project}`)
        .end(function(err, res) {
            assert.equal(res.status, 200);
            assert.equal(res.body.length,2);
        });
    });

    test('View issues on a project with one filter',async function() {
        const issues = [{
            issue_title: "Fix error in posting data",
            issue_text: "When we post data it has an error.",
            created_by: "Joe",
            assigned_to: "Joe",
            status_text: "In QA"
        },{
            issue_title: "Fix error in posting data 2",
            issue_text: "When we post data it has an error 2.",
            created_by: "Joe2",
            assigned_to: "Joe2",
            status_text: "In QA2"
        }];
        const project = 'oneFilter';
        for (const issue of issues) {
            await addIssue(project, issue);
          }
        chai
        .request(server)
        .get(`/api/issues/${project}?open=false`)
        .end(function(err, res) {
            assert.equal(res.status, 200);
            assert.equal(res.body.length,0);
        });
    });

    test('View issues on a project with multiple filter',async function() {
        const issues = [{
            issue_title: "Fix error in posting data",
            issue_text: "When we post data it has an error.",
            created_by: "Joe",
            assigned_to: "Joe",
            status_text: "In QA"
        },{
            issue_title: "Fix error in posting data 2",
            issue_text: "When we post data it has an error 2.",
            created_by: "Joe2",
            assigned_to: "Joe2",
            status_text: "In QA2"
        }];
        const project = 'multipleFilter';
        for (const issue of issues) {
            await addIssue(project, issue);
          }
        chai
        .request(server)
        .get(`/api/issues/${project}?open=true&assigned_to=Joe`)
        .end(function(err, res) {
            assert.equal(res.status, 200);
            assert.equal(res.body.length,1);
        });
    });

    test('Update one field on an issue', async function() {
        const issue = {
            issue_title: "Fix error in posting data",
            issue_text: "When we post data it has an error.",
            created_by: "Joe",
            assigned_to: "Joe",
            status_text: "In QA"
        };
        const project = 'updateOneField';
        const issueRes = await addIssue(project,issue);
        const updateIssue = {
            issue_title: "Fix error in posting data update",
            _id:issueRes._id,
        };
        chai
        .request(server)
        .put(`/api/issues/${project}`)
        .send(updateIssue)
        .end(async function(err, res) {
            assert.equal(res.status, 200);
            assert.equal(res.body.result,'successfully updated');
            assert.equal(res.body._id,issueRes._id);
            const newIssue = await queryIssues(project);
            assert.equal(newIssue.issue_title,updateIssue.issue_title);
            assert.isFalse(newIssue.updated_on !== newIssue.updated_on);
        });
    });

    test('Update multiple field on an issue', async function() {
        const issue = {
            issue_title: "Fix error in posting data",
            issue_text: "When we post data it has an error.",
            created_by: "Joe",
            assigned_to: "Joe",
            status_text: "In QA"
        };
        const project = 'updateMultipleField';
        const issueRes = await addIssue(project,issue);
        const updateIssue = {
            issue_title: "Fix error in posting data update",
            issue_text: "When we post data it has an error. update",
            _id:issueRes._id,
        };
        chai
        .request(server)
        .put(`/api/issues/${project}`)
        .send(updateIssue)
        .end(async function(err, res) {
            assert.equal(res.status, 200);
            assert.equal(res.body.result,'successfully updated');
            assert.equal(res.body._id,issueRes._id);
            const newIssue = await queryIssues(project);
            assert.equal(newIssue.issue_text,updateIssue.issue_text);
            assert.equal(newIssue.issue_title,updateIssue.issue_title);
            assert.isFalse(newIssue.updated_on !== newIssue.updated_on);
        });
    });

    test('Update an issue with missing _id', async function() {
        const issue = {
            issue_title: "Fix error in posting data",
            issue_text: "When we post data it has an error.",
            created_by: "Joe",
            assigned_to: "Joe",
            status_text: "In QA"
        };
        const project = 'updateMissing';
        const issueRes = await addIssue(project,issue);
        const updateIssue = {
        };
        chai
        .request(server)
        .put(`/api/issues/${project}`)
        .send(updateIssue)
        .end(function(err, res) {
            assert.equal(res.status, 200);
            assert.equal(res.body.error,'missing _id');
        });
    });

    test('Update an issue with no fields to update', async function() {
        const issue = {
            issue_title: "Fix error in posting data",
            issue_text: "When we post data it has an error.",
            created_by: "Joe",
            assigned_to: "Joe",
            status_text: "In QA"
        };
        const project = 'updateNotFields';
        const issueRes = await addIssue(project,issue);
        const updateIssue = {
            _id:issueRes._id,
        };
        chai
        .request(server)
        .put(`/api/issues/${project}`)
        .send(updateIssue)
        .end(function(err, res) {
            assert.equal(res.status, 200);
            assert.equal(res.body.error,'no update field(s) sent');
            assert.equal(res.body._id,issueRes._id);
        });
    });

    test('Update an issue with an invalid _id', async function() {
        const issue = {
            issue_title: "Fix error in posting data",
            issue_text: "When we post data it has an error.",
            created_by: "Joe",
            assigned_to: "Joe",
            status_text: "In QA"
        };
        const project = 'updateMissing';
        const issueRes = await addIssue(project,issue);
        const updateIssue = {
            _id:'xxxxx'
        };
        chai
        .request(server)
        .put(`/api/issues/${project}`)
        .send(updateIssue)
        .end(function(err, res) {
            assert.equal(res.status, 200);
            assert.equal(res.body.error,'no update field(s) sent');
            assert.equal(res.body._id,updateIssue._id);
        });

        const updateIssueField = {
            _id:'xxxxx',
            issue_text: "When we post data it has an error.",
        };
        chai
        .request(server)
        .put(`/api/issues/${project}`)
        .send(updateIssueField)
        .end(function(err, res) {
            assert.equal(res.status, 200);
            assert.equal(res.body.error,'could not update');
            assert.equal(res.body._id,updateIssue._id);
        });
    });

    test('Delete an issue: DELETE', async function() {
        const issue = {
            issue_title: "Fix error in posting data",
            issue_text: "When we post data it has an error.",
            created_by: "Joe",
            assigned_to: "Joe",
            status_text: "In QA"
        };
        const project = 'delete';
        const issueRes = await addIssue(project,issue);
        const deleteIssue = {
            _id:issueRes._id
        };
        chai
        .request(server)
        .delete(`/api/issues/${project}`)
        .send(deleteIssue)
        .end(function(err, res) {
            assert.equal(res.status, 200);
            assert.equal(res.body.result,'successfully deleted');
            assert.equal(res.body._id,issueRes._id);
        });
    });

    test('Delete an issue with an invalid _id', async function() {
        const issue = {
            issue_title: "Fix error in posting data",
            issue_text: "When we post data it has an error.",
            created_by: "Joe",
            assigned_to: "Joe",
            status_text: "In QA"
        };
        const project = 'deleteInvalid';
        const issueRes = await addIssue(project,issue);
        const deleteIssue = {
            _id:issueRes._id +'XXX'
        };
        chai
        .request(server)
        .delete(`/api/issues/${project}`)
        .send(deleteIssue)
        .end(function(err, res) {
            assert.equal(res.status, 200);
            assert.equal(res.body.error,'could not delete');
            assert.equal(res.body._id,deleteIssue._id
            );
        });
    });

    test('Delete an issue with missing _id', async function() {
        const issue = {
            issue_title: "Fix error in posting data",
            issue_text: "When we post data it has an error.",
            created_by: "Joe",
            assigned_to: "Joe",
            status_text: "In QA"
        };
        const project = 'deleteMissing';
        const issueRes = await addIssue(project,issue);
        const deleteIssue = {
        };
        chai
        .request(server)
        .delete(`/api/issues/${project}`)
        .send(deleteIssue)
        .end(function(err, res) {
            assert.equal(res.status, 200);
            assert.equal(res.body.error,'missing _id');
        });
    });

});
