var fs = require('fs');
var wkhtmltopdf = require('wkhtmltopdf');
var config = require('./../config');
var API_SERVER = config.PROXY_URL;
var request = require('request');

module.exports = {
  exportPdf: function(req, res) {
    var type = req.params.type;
    var docId = req.params.id;
    var userId = req.params.userId;
    var projectId = req.params.projectId;

    wkhtmltopdf.command = 'wkhtmltopdf';

    var transformKeyValues = function(keyValues) {
      var newKeyValues = keyValues;
      for(var i = 0; i < keyValues.length; i++) {
        var keyValue = keyValues[i];
        var key = keyValue.key;
        var value = keyValue.value;
        if(keyValue.key === 'date_created' || keyValue.key === 'date' || keyValue.key === 'received_by_date' || keyValue.key === 'sent_by_date' || keyValue.key === 'due_by_date') {
          value = new Date(value);
        }
        newKeyValues[key] = value;
      }
      return newKeyValues;
    };

    var transformGridKeyValues = function(gridKeyValues) {
      var newGridKeyValues = {};
      for(var i = 0; i < gridKeyValues.length; i++) {
        var grid = gridKeyValues[i];
        if(newGridKeyValues[grid.gridRowIndex] === undefined) {
          newGridKeyValues[grid.gridRowIndex] = [
            {
              "value": grid.value,
              "key": grid.key
            }
          ];
        } else {
          newGridKeyValues[grid.gridRowIndex].push({
            "value": grid.value,
            "key": grid.key
          });
        }
      }

      return newGridKeyValues;
    };

    function fillPOData(html, data) {
      html = html.replace(/\{\{company_name}}/g, data.keyValues.company_name || '');
      html = html.replace(/\{\{createdBy}}/g, data.createdBy || '');
      html = html.replace(/\{\{company}}/g, data.keyValues.company || '');
      html = html.replace(/\{\{createdDate}}/g, data.createdDate || '');
      html = html.replace(/\{\{address}}/g, data.keyValues.address || '');
      html = html.replace(/\{\{username}}/g, data.keyValues.username || '');
      html = html.replace(/\{\{attention}}/g, data.keyValues.attention || '');
      html = html.replace(/\{\{subject}}/g, data.keyValues.subject || '');
      html = html.replace(/\{\{PO}}/g, data.keyValues.PO || '');
      html = html.replace(/\{\{address}}/g, data.keyValues.address || '');
      html = html.replace(/\{\{priority}}/g, data.keyValues.priority || '');
      html = html.replace(/\{\{dueDate}}/g, data.dueDate || '');
      html = html.replace(/\{\{shipping_method}}/g, data.keyValues.shipping_method || '');
      html = html.replace(/\{\{shipping_terms}}/g, data.keyValues.shipping_terms || '');
      html = html.replace(/\{\{shipping_name}}/g, data.keyValues.shipping_name || '');
      html = html.replace(/\{\{ship_to_company}}/g, data.keyValues.ship_to_company || '');
      html = html.replace(/\{\{ship_to_address}}/g, data.keyValues.ship_to_address || '');
      html = html.replace(/\{\{total_po_amount}}/g, data.keyValues.total_po_amount || '');
      html = html.replace(/\{\{notes}}/g, data.keyValues.notes || '');
      html = html.replace(/\{\{approvedBy}}/g, data.approvedBy || '');
      html = html.replace(/\{\{approvedDate}}/g, data.approvedDate || '');
      html = html.replace(/\{\{attachments}}/g, data.attachments || '');

      wkhtmltopdf(html, {pageSize: 'letter'}).pipe(res);
    }

    function fillCOData(html, data) {
      html = html.replace(/\{\{company_name}}/g, data.keyValues.company_name || '');
      html = html.replace(/\{\{createdBy}}/g, data.createdBy || '');
      html = html.replace(/\{\{company}}/g, data.keyValues.company || '');
      html = html.replace(/\{\{createdDate}}/g, data.createdDate || '');
      html = html.replace(/\{\{address}}/g, data.keyValues.address || '');
      html = html.replace(/\{\{username}}/g, data.keyValues.username || '');
      html = html.replace(/\{\{subject}}/g, data.keyValues.subject || '');
      html = html.replace(/\{\{co}}/g, data.keyValues.co || '');
      html = html.replace(/\{\{location}}/g, data.keyValues.location || '');
      html = html.replace(/\{\{dueDate}}/g, data.dueDate || '');
      html = html.replace(/\{\{description}}/g, data.keyValues.description || '');
      html = html.replace(/\{\{contract_no}}/g, data.keyValues.contract_no || '');
      html = html.replace(/\{\{date_created}}/g, data.keyValues.date_created || '');
      html = html.replace(/\{\{contract_title}}/g, data.keyValues.contract_title || '');
      html = html.replace(/\{\{priority}}/g, data.keyValues.priority || '');
      html = html.replace(/\{\{discipline}}/g, data.keyValues.discipline || '');
      html = html.replace(/\{\{category}}/g, data.keyValues.categorys || '');
      html = html.replace(/\{\{schedule_impact}}/g, data.keyValues.schedule_impact || '');
      html = html.replace(/\{\{cost_impact}}/g, data.keyValues.cost_impact || '');
      html = html.replace(/\{\{time_impact}}/g, data.keyValues.time_impact || '');
      html = html.replace(/\{\{specification}}/g, data.keyValues.specification || '');
      html = html.replace(/\{\{drawing}}/g, data.keyValues.drawing || '');
      html = html.replace(/\{\{cost.workDescription}}/g, '');
      html = html.replace(/\{\{cost.costCode}}/g, '');
      html = html.replace(/\{\{cost.amount}}/g, '');
      html = html.replace(/\{\{cost_code}}/g, data.keyValues.cost_code || '');
      html = html.replace(/\{\{approvedBy}}/g, data.approvedBy || '');
      html = html.replace(/\{\{approvedDate}}/g, data.approvedDate || '');
      html = html.replace(/\{\{attachments}}/g, data.attachments || '');

      wkhtmltopdf(html, {pageSize: 'letter'}).pipe(res);
    }

    function fillTransData(html, data) {
      html = html.replace(/\{\{company_name}}/g, data.keyValues.company_name || '');
      html = html.replace(/\{\{createdBy}}/g, data.createdBy || '');
      html = html.replace(/\{\{company}}/g, data.keyValues.company || '');
      html = html.replace(/\{\{createdDate}}/g, data.createdDate || '');
      html = html.replace(/\{\{address}}/g, data.keyValues.address || '');
      html = html.replace(/\{\{username}}/g, data.keyValues.username || '');
      html = html.replace(/\{\{sent_via}}/g, data.keyValues.sent_via || '');
      html = html.replace(/\{\{subject}}/g, data.keyValues.subject || '');
      html = html.replace(/\{\{transmittal}}/g, data.keyValues.transmittal || '');

      html = html.replace(/\{\{approval}}/g, data.keyValues.approval === 'YES' ? 'checked' : '');
      html = html.replace(/\{\{for_use}}/g, data.keyValues.for_use === 'YES' ? 'checked' : '');
      html = html.replace(/\{\{review_and_comment}}/g, data.keyValues.review_and_comment === 'YES' ? 'checked' : '');
      html = html.replace(/\{\{further_processing}}/g, data.keyValues.further_processing === 'YES' ? 'checked' : '');

      html = html.replace(/\{\{out_for_signature}}/g, data.keyValues.out_for_signature === 'YES' ? 'checked' : '');
      html = html.replace(/\{\{approve_as_submitted}}/g, data.keyValues.approve_as_submitted === 'YES' ? 'checked' : '');
      html = html.replace(/\{\{approve_as_noted}}/g, data.keyValues.approve_as_noted === 'YES' ? 'checked' : '');
      html = html.replace(/\{\{submit}}/g, data.keyValues.submit === 'YES' ? 'checked' : '');
      html = html.replace(/\{\{resubmitted}}/g, data.keyValues.resubmitted === 'YES' ? 'checked' : '');
      html = html.replace(/\{\{returned}}/g, data.keyValues.returned === 'YES' ? 'checked' : '');
      html = html.replace(/\{\{returned_for_corrections}}/g, data.keyValues.returned_for_corrections === 'YES' ? 'checked' : '');
      html = html.replace(/\{\{resubmit}}/g, data.keyValues.resubmit === 'YES' ? 'checked' : '');
      html = html.replace(/\{\{received_as_noted}}/g, data.keyValues.received_as_noted === 'YES' ? 'checked' : '');

      html = html.replace(/\{\{due_by}}/g, data.keyValues.due_by === 'YES' ? 'checked' : '');
      html = html.replace(/\{\{received_by}}/g, data.keyValues.received_by === 'YES' ? 'checked' : '');
      html = html.replace(/\{\{sent_date}}/g, data.keyValues.sent_date === 'YES' ? 'checked' : '');

      html = html.replace(/\{\{due_by_date}}/g, data.keyValues.due_by_date || '');
      html = html.replace(/\{\{received_by_date}}/g, data.keyValues.received_by_date || '');
      html = html.replace(/\{\{sent_by_date}}/g, data.keyValues.sent_by_date || '');

      html = html.replace(/\{\{items}}/g, data.keyValues.items || '');
      html = html.replace(/\{\{description}}/g, data.keyValues.description || '');
      html = html.replace(/\{\{dueDate}}/g, data.keyValues.dueDate || '');
      html = html.replace(/\{\{copies}}/g, data.keyValues.copies || '');
      html = html.replace(/\{\{comment}}/g, data.keyValues.comment || '');

      html = html.replace(/\{\{approvedBy}}/g, data.keyValues.approvedBy || '');
      html = html.replace(/\{\{approvedDate}}/g, data.keyValues.approvedDate || '');
      html = html.replace(/\{\{attachments}}/g, data.keyValues.attachments || '');

      wkhtmltopdf(html, {pageSize: 'letter'}).pipe(res);
    }

    function fillRFIData(html, data) {
      html = html.replace(/\{\{company_name}}/g, data.keyValues.company_name || '');
      html = html.replace(/\{\{createdBy}}/g, data.createdBy || '');
      html = html.replace(/\{\{company}}/g, data.keyValues.company || '');
      html = html.replace(/\{\{createdDate}}/g, data.createdDate || '');
      html = html.replace(/\{\{address}}/g, data.keyValues.address || '');
      html = html.replace(/\{\{username}}/g, data.keyValues.username || '');
      html = html.replace(/\{\{attention}}/g, data.keyValues.attention || '');

      html = html.replace(/\{\{subject}}/g, data.keyValues.subject || '');
      html = html.replace(/\{\{RFI}}/g, data.keyValues.RFI || '');
      html = html.replace(/\{\{question_or_concern}}/g, data.keyValues.question_or_concern || '');
      html = html.replace(/\{\{suggestion}}/g, data.keyValues.suggestion || '');

      html = html.replace(/\{\{rfi_is_a_change}}/g, data.keyValues.rfi_is_a_change === 'YES' ? 'checked' : '');
      html = html.replace(/\{\{open}}/g, data.status === 'OPEN' ? 'checked' : '');
      html = html.replace(/\{\{closed}}/g, data.status === 'CLOSED' ? 'checked' : '');

      var response = '<div class="form-group">\
      <div class="box">\
      <p>RESPONSE : {{title}}</p>\
    <p>Reply : {{reply}}</p>\
    <p>By : {{responseBy}}</p>\
    <p>Date : {{responseDate}}</p>\
    <p>Time : {{responseTime}}</p>\
    </div>\
    </div>';

      var responseData = {};

      response = response.replace(/\{\{title}}/g, responseData.title || '');
      response = response.replace(/\{\{reply}}/g, responseData.reply || '');
      response = response.replace(/\{\{responseBy}}/g, responseData.responsedBy ? responseData.responsedBy.contact ? responseData.responsedBy.contact.firstName + ' ' + responseData.responsedBy.contact.lastName : '' : '');
      response = response.replace(/\{\{responsedDate}}/g, responseData.responsedDate.getDate() + '/' + responseData.responsedDate.getMonth() + '/' + responseData.responsedDate.getYear() || '');
      response = response.replace(/\{\{responseTime}}/g, responseData.responsedDate.getTime() || '');

      html = html.replace(/\{\{responses}}/g, response || '');

      wkhtmltopdf(html, {pageSize: 'letter'}).pipe(res);
    }

    function getDocumentById(t, i) {
      var body = {};
      request({
          method: 'POST',
          body: body,
          json: true,
          url: API_SERVER + '/documents/getDocument'
        },
        function(error, response, body) {
          if(!error && response.statusCode == 200) {
            var document = response.document, html, data = {
              keyValues: {}
            };

            switch(type) {
              case "po":
                html = fs.readFileSync('./../assets/templates/purchaseOrder.html', 'utf8');
                fillPOData(html, data);
                break;
              case "co":
                html = fs.readFileSync('./../assets/templates/changeOrder.html', 'utf8');
                fillCOData(html, data);
                break;
              case "rfi":
                html = fs.readFileSync('./../assets/templates/requestForInformation.html', 'utf8');
                fillRFIData(html, data);
                break;
              case "tr":
                html = fs.readFileSync('./../assets/templates/transmittal.html', 'utf8');
                fillTransData(html, data);
                break;
              default:
                res.status(404)        // HTTP status 404: NotFound
                  .send('Document not found');
            }
          } else {
            res.send(error);
          }
        });
    }

    getDocumentById(type, docId);
  }
};