var fs = require('fs');
var wkhtmltopdf = require('wkhtmltopdf');
var config = require('./../config');
var API_SERVER = config.PROXY_URL;
var path = require('path');
var request = require('request');
var _ = require('lodash');
var rootPath = GLOBAL.ROOTPATH;
var Promise = require('promise');
var moment = require('moment');
var utilService = require('./../services/util');
var aws = require('./../services/aws');

module.exports = {
  exportPdf: function(req, res) {
    var data = req.body.document,
      baseRequest = req.body.baseRequest,
      projectAssetFolderName = req.body.projectAssetFolderName,
      fileName,
      destinationPath,
      html;

    switch(data.documentTemplate.documentTemplateId) {
      case 1:
        fileName = "purchase_order_" + data.documentId + ".pdf";
        break;
      case 2:
        fileName = "change_order_" + data.documentId + ".pdf";
        break;
      case 3:
        fileName = "request_for_information_" + data.documentId + ".pdf";
        break;
      case 4:
        fileName = "transmittal_" + data.documentId + ".pdf";
        break;
    }

    var key = string.join('/', 'assets', 'projects', projectAssetFolderName, 'onfile', fileName);

    utilService.ensureFolderExist(path.join(rootPath, 'assets'));
    utilService.ensureFolderExist(path.join(rootPath, 'assets', 'projects'));
    destinationPath = path.join(rootPath, 'assets', 'projects', projectAssetFolderName);
    utilService.ensureFolderExist(destinationPath);
    destinationPath = path.join(destinationPath, 'onfile');
    utilService.ensureFolderExist(destinationPath);
    destinationPath = path.join(destinationPath, fileName);

    wkhtmltopdf.command = 'wkhtmltopdf';

    function getCompanyDetails(baseRequest) {
      return new Promise(function(resolve, reject) {
        // Get project details
        request({
          method: 'POST',
          body: {"projectId": baseRequest.loggedInUserProjectId, "baseRequest": baseRequest},
          json: true,
          url: config.PROXY_URL + '/project/getProject'
        }, function(err, response) {
          if(!err) {
            // Get company info
            request({
              method: 'POST',
              body: {"companyId": response.body.project.company.companyId, "baseRequest": baseRequest},
              json: true,
              url: config.PROXY_URL + '/company/getCompanyInfo'
            }, function(err, response) {
              if(!err) {
                resolve(string.join('/', config.resource_domain, response.body.company.companyLogoPath));
              } else {
                resolve('');
              }
            });
          } else {
            resolve('');
          }
        });
      });
    }

    function getAttachments(baseRequest, documentId) {
      return new Promise(function(resolve, reject) {
        request({
          method: 'POST',
          body: {"documentId": documentId, "baseRequest": baseRequest},
          json: true,
          url: config.PROXY_URL + '/document/attachment/getAll'
        }, function(err, response) {
          if(err) {
            resolve([]);
          } else {
            resolve(response.body.attachments);
          }
        });
      });
    }

    function createAttachmentsHtml(attachments) {
      //var attachmentHtml = '<p><a href="{{attachmentLink}}">{{attachmentName}}</a></p>', attHtml = '';
      //_.each(attachments, function(att) {
      //  var attachmentHtmlCopy = attachmentHtml;
      //  attachmentHtmlCopy = attachmentHtmlCopy.replace(/\{\{attachmentLink}}/g, config.domain + '/download/file?id=' + utilService.hash(encodeURIComponent(att.filePath)));
      //  attachmentHtmlCopy = attachmentHtmlCopy.replace(/\{\{attachmentName}}/g, att.filePath.substring(att.filePath.lastIndexOf('/') + 1));
      //  attHtml = attHtml + attachmentHtmlCopy;
      //});
      //return attHtml;

      var attachmentHtml = '<table style="border: none; border-collapse: collapse; width: 100%;" border="0">', attHtml = '';
      _.each(attachments, function(att) {
        if(/\.(jpg|jpeg|png)$/i.test(att.filePath)) {
          attachmentHtml += '<tr><td style="text-align:center; border: solid 1px #e5e5e5; padding: 5px;"><img style="max-width: 100%;" src="' + string.join('/', config.domain, att.filePath) + '"><p style="margin: 10px 0;"><a style="color: #5B90BF; font-weight: bold;" href="' + config.domain + '/download/file?id=' + utilService.hash(encodeURIComponent(att.filePath)) + '">' + string.path(att.filePath).name + '</a></p></td></tr>';
        }
        else {
          attachmentHtml += '<tr><td style="text-align:center; border: solid 1px #e5e5e5; padding: 5px;"><a style="color: #5B90BF; font-weight: bold;" href="' + config.domain + '/download/file?id=' + utilService.hash(encodeURIComponent(att.filePath)) + '">' + string.path(att.filePath).name + '</a></td></tr>';
        }
      });
      attachmentHtml += '</table>';
      return attachmentHtml;
    }

    function failure(err) {
      res.status(400);
      res.send('Error');
    }

    function success() {
      res.send({
        success: true,
        filePath: 'assets/projects/' + projectAssetFolderName + '/onfile/' + fileName
      });
    }

    function fillPOData(html, data) {
      html = html.replace(/\{\{company_logo}}/g, data.companyLogoPath);
      html = html.replace(/\{\{company_name}}/g, data.keyValues.company_name);
      html = html.replace(/\{\{createdBy}}/g, data.creator.contact.firstName + ' ' + data.creator.contact.lastName);
      html = html.replace(/\{\{company}}/g, data.creator.companyName);
      html = html.replace(/\{\{createdDate}}/g, moment(data.keyValues.date_created).format('MM/DD/YYYY'));
      html = html.replace(/\{\{address}}/g, data.creator.companyAddress);
      html = html.replace(/\{\{username}}/g, data.keyValues.receiverName);
      html = html.replace(/\{\{attention}}/g, data.keyValues.attention);
      html = html.replace(/\{\{subject}}/g, data.keyValues.subject);
      html = html.replace(/\{\{PO}}/g, data.keyValues.PO);
      html = html.replace(/\{\{priority}}/g, data.keyValues.priority);
      html = html.replace(/\{\{dueDate}}/g, moment(data.dueDate).format('MM/DD/YYYY'));
      html = html.replace(/\{\{shipping_method}}/g, data.keyValues.shipping_method);
      html = html.replace(/\{\{shipping_terms}}/g, data.keyValues.shipping_terms);
      html = html.replace(/\{\{shipping_name}}/g, data.keyValues.ship_to_name);
      html = html.replace(/\{\{ship_to_company}}/g, data.keyValues.ship_to_company);
      html = html.replace(/\{\{ship_to_address}}/g, data.keyValues.ship_to_address);
      html = html.replace(/\{\{total_po_amount}}/g, data.keyValues.total_po_amount);
      html = html.replace(/\{\{notes}}/g, data.keyValues.notes);
      html = html.replace(/\{\{approvedBy}}/g, data.keyValues.receiver.contact.firstName + ' ' + data.keyValues.receiver.contact.lastName);
      html = html.replace(/\{\{approvedDate}}/g, data.keyValues.approveRejectDate ? moment(data.keyValues.approveRejectDate).format('MM/DD/YYYY') : '');

      // Attachments
      html = html.replace(/\{\{attachments}}/g, createAttachmentsHtml(data.attachments));

      //if(fs.existsSync(destinationPath)) {
      //  fs.unlinkSync(destinationPath);
      //}

      //var stream = wkhtmltopdf(html, {pageSize: 'letter'}).pipe(fs.createWriteStream(destinationPath));
      //stream
      //  .on("error", function(error) {
      //    console.error("Problem copying file: " + error.stack);
      //    failure(error);
      //  })
      //  .on("finish", success);

      aws.s3.removeFileIfExists(key)
        .then(function() {
          aws.s3.upload(wkhtmltopdf(html, {pageSize: 'letter'}), key)
            .then(success, failure);
        }, function(){
          console.log('Cannot delete file from S3');
          failure();
        });
    }

    function fillCOData(html, data) {
      html = html.replace(/\{\{company_logo}}/g, data.companyLogoPath);
      html = html.replace(/\{\{company_name}}/g, data.keyValues.company_name);
      html = html.replace(/\{\{createdBy}}/g, data.creator.contact.firstName + ' ' + data.creator.contact.lastName);
      html = html.replace(/\{\{company}}/g, data.creator.companyName);
      html = html.replace(/\{\{createdDate}}/g, moment(data.keyValues.date_created).format('MM/DD/YYYY'));
      html = html.replace(/\{\{address}}/g, data.creator.companyAddress);
      html = html.replace(/\{\{username}}/g, data.keyValues.receiverName);
      html = html.replace(/\{\{subject}}/g, data.keyValues.subject);
      html = html.replace(/\{\{co}}/g, data.keyValues.co);
      html = html.replace(/\{\{location}}/g, data.keyValues.location);
      html = html.replace(/\{\{dueDate}}/g, moment(data.dueDate).format('MM/DD/YYYY'));
      html = html.replace(/\{\{description}}/g, data.keyValues.description);
      html = html.replace(/\{\{contract_no}}/g, data.keyValues.contract_no);
      html = html.replace(/\{\{date_created}}/g, moment(data.keyValues.date_created).format('MM/DD/YYYY'));
      html = html.replace(/\{\{contract_title}}/g, data.keyValues.contract_title);
      html = html.replace(/\{\{priority}}/g, data.keyValues.priority);
      html = html.replace(/\{\{discipline}}/g, data.keyValues.discipline);
      html = html.replace(/\{\{category}}/g, data.keyValues.category);
      html = html.replace(/\{\{schedule_impact}}/g, data.keyValues.schedule_impact);
      html = html.replace(/\{\{cost_impact}}/g, data.keyValues.cost_impact);
      html = html.replace(/\{\{time_impact}}/g, data.keyValues.time_impact);
      html = html.replace(/\{\{specification}}/g, data.keyValues.specification);
      html = html.replace(/\{\{drawing}}/g, data.keyValues.drawing);
      html = html.replace(/\{\{cost.workDescription}}/g, '');
      html = html.replace(/\{\{cost.costCode}}/g, '');
      html = html.replace(/\{\{cost.amount}}/g, '');
      html = html.replace(/\{\{cost_code}}/g, data.keyValues.cost_code);
      html = html.replace(/\{\{approvedBy}}/g, data.keyValues.receiver.contact.firstName + ' ' + data.keyValues.receiver.contact.lastName);
      html = html.replace(/\{\{approvedDate}}/g, data.keyValues.approveRejectDate ? moment(data.keyValues.approveRejectDate).format('MM/DD/YYYY') : '');
      html = html.replace(/\{\{amount}}/g, '$' + data.keyValues.amount.toLocaleString());

      // Attachments
      html = html.replace(/\{\{attachments}}/g, createAttachmentsHtml(data.attachments));

      var gridKeys = '';
      var temp = '<tr>\
            <td>{{workDescription}}</td>\
            <td>{{costCode}}</td>\
            <td>{{amount}}</td>\
        </tr>';
      for(var i = 0; i < data.gridKeyValues.length; i++) {
        var gridKey = temp;
        gridKey = gridKey.replace(/\{\{workDescription}}/g, data.gridKeyValues[i].workDescription);
        gridKey = gridKey.replace(/\{\{costCode}}/g, data.gridKeyValues[i].costCode);
        gridKey = gridKey.replace(/\{\{amount}}/g, '$' + data.gridKeyValues[i].amount.toLocaleString());

        gridKeys = gridKeys + gridKey;
      }

      html = html.replace(/\{\{gridKeyValues}}/g, gridKeys);

      //if(fs.existsSync(destinationPath)) {
      //  fs.unlinkSync(destinationPath);
      //}
      //
      //var stream = wkhtmltopdf(html, {pageSize: 'letter'}).pipe(fs.createWriteStream(destinationPath));
      //stream
      //  .on("error", function(error) {
      //    console.error("Problem copying file: " + error.stack);
      //    failure(error);
      //  })
      //  .on("finish", success);

      aws.s3.removeFileIfExists(key)
        .then(function() {
          aws.s3.upload(wkhtmltopdf(html, {pageSize: 'letter'}), key)
            .then(success, failure);
        }, function(){
          console.log('Cannot delete file from S3');
          failure();
        });
    }

    function fillTransData(html, data) {
      html = html.replace(/\{\{company_logo}}/g, data.companyLogoPath);
      html = html.replace(/\{\{company_name}}/g, data.keyValues.company_name);
      html = html.replace(/\{\{createdBy}}/g, data.creator.contact.firstName + ' ' + data.creator.contact.lastName);
      html = html.replace(/\{\{company}}/g, data.creator.companyName);
      html = html.replace(/\{\{createdDate}}/g, moment(data.keyValues.date_created).format('MM/DD/YYYY'));
      html = html.replace(/\{\{address}}/g, data.creator.companyAddress);
      html = html.replace(/\{\{username}}/g, data.keyValues.receiverName);
      html = html.replace(/\{\{sent_via}}/g, data.keyValues.sent_via);
      html = html.replace(/\{\{subject}}/g, data.keyValues.subject);
      html = html.replace(/\{\{transmittal}}/g, data.keyValues.transmittal);

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

      html = html.replace(/\{\{due_by_date}}/g, moment(data.keyValues.due_by_date).format('MM/DD/YYYY'));
      html = html.replace(/\{\{received_by_date}}/g, moment(data.keyValues.received_by_date).format('MM/DD/YYYY'));
      html = html.replace(/\{\{sent_by_date}}/g, moment(data.keyValues.sent_by_date).format('MM/DD/YYYY'));

      html = html.replace(/\{\{items}}/g, data.keyValues.items);
      html = html.replace(/\{\{description}}/g, data.keyValues.description);
      html = html.replace(/\{\{dueDate}}/g, moment(data.dueDate).format('MM/DD/YYYY'));
      html = html.replace(/\{\{copies}}/g, data.keyValues.copies);
      html = html.replace(/\{\{comment}}/g, data.keyValues.comments);

      html = html.replace(/\{\{approvedBy}}/g, data.keyValues.receiver.contact.firstName + ' ' + data.keyValues.receiver.contact.lastName);
      html = html.replace(/\{\{approvedDate}}/g, data.keyValues.approveRejectDate ? moment(data.keyValues.approveRejectDate).format('MM/DD/YYYY') : '');

      // Attachments
      html = html.replace(/\{\{attachments}}/g, createAttachmentsHtml(data.attachments));

      //if(fs.existsSync(destinationPath)) {
      //  fs.unlinkSync(destinationPath);
      //}
      //
      //var stream = wkhtmltopdf(html, {pageSize: 'letter'}).pipe(fs.createWriteStream(destinationPath));
      //stream
      //  .on("error", function(error) {
      //    console.error("Problem copying file: " + error.stack);
      //    failure(error);
      //  })
      //  .on("finish", success);

      aws.s3.removeFileIfExists(key)
        .then(function() {
          aws.s3.upload(wkhtmltopdf(html, {pageSize: 'letter'}), key)
            .then(success, failure);
        }, function(){
          console.log('Cannot delete file from S3');
          failure();
        });
    }

    function fillRFIData(html, data) {
      html = html.replace(/\{\{company_logo}}/g, data.companyLogoPath || '');
      html = html.replace(/\{\{company_name}}/g, data.keyValues.company_name || '');
      html = html.replace(/\{\{createdBy}}/g, data.creator.contact.firstName + ' ' + data.creator.contact.lastName);
      html = html.replace(/\{\{company}}/g, data.creator.companyName || '');
      html = html.replace(/\{\{createdDate}}/g, moment(data.keyValues.date_created).format('MM/DD/YYYY'));
      html = html.replace(/\{\{address}}/g, data.creator.companyAddress || '');
      html = html.replace(/\{\{username}}/g, data.keyValues.receiverName || '');
      html = html.replace(/\{\{attention}}/g, _.map(data.keyValues.attention, function(el) {
        return el.contact.firstName + ' ' + el.contact.lastName;
      }).join(', '));

      html = html.replace(/\{\{subject}}/g, data.keyValues.subject || '');
      html = html.replace(/\{\{RFI}}/g, data.keyValues.RFI || '');
      html = html.replace(/\{\{question_or_concern}}/g, data.keyValues.question_or_concern || '');
      html = html.replace(/\{\{suggestion}}/g, data.keyValues.suggestion || '');

      html = html.replace(/\{\{rfi_is_a_change}}/g, data.keyValues.rfi_is_a_change === 'YES' ? 'checked' : '');
      html = html.replace(/\{\{open}}/g, data.status === 'SUBMITTED' ? 'checked' : '');
      html = html.replace(/\{\{closed}}/g, (data.status === 'APPROVED' || data.status === 'REJECTED') ? 'checked' : '');

      // Responses
      var response = '<div class="response-item">\
      <p><span class="date">({{responseDate}})</span> <span class="author">{{responseBy}}</span> said: {{reply}}</p>\
      </div>';
      var responseData = data.responseData;
      var resHtml = '';
      for(var i = 0; i < responseData.length; i++) {
        var res = response;
        res = res.replace(/\{\{reply}}/g, responseData[i].response);
        res = res.replace(/\{\{responseBy}}/g, responseData[i].responsedBy.contact.firstName + ' ' + responseData[i].responsedBy.contact.lastName);
        res = res.replace(/\{\{responseDate}}/g, moment(responseData[i].responsedDate).format('MM/DD/YYYY hh:mm a'));
        resHtml = resHtml + res;
      }
      html = html.replace(/\{\{responses}}/g, resHtml);

      // Attachments
      var attachmentHtml = createAttachmentsHtml(data.attachments);
      html = html.replace(/\{\{attachments}}/g, attachmentHtml);

      /*response = response.replace(/\{\{title}}/g, responseData.title);
       response = response.replace(/\{\{reply}}/g, responseData.reply);
       response = response.replace(/\{\{responseBy}}/g, responseData.responsedBy ? responseData.responsedBy.contact ? responseData.responsedBy.contact.firstName + ' ' + responseData.responsedBy.contact.lastName : '' : '');
       response = response.replace(/\{\{responsedDate}}/g, responseData.responsedDate.getDate() + '/' + responseData.responsedDate.getMonth() + '/' + responseData.responsedDate.getYear());
       response = response.replace(/\{\{responseTime}}/g, responseData.responsedDate.getTime());*/

      //if(fs.existsSync(destinationPath)) {
      //  fs.unlinkSync(destinationPath);
      //}

      //var stream = wkhtmltopdf(html, {pageSize: 'letter'}).pipe(fs.createWriteStream(destinationPath));
      //stream
      //  .on("error", function(error) {
      //    console.error("Problem copying file: " + error.stack);
      //    failure(error);
      //  })
      //  .on("finish", success);

      aws.s3.removeFileIfExists(key)
        .then(function() {
          aws.s3.upload(wkhtmltopdf(html, {pageSize: 'letter'}), key)
            .then(success, failure);
        }, function(){
          console.log('Cannot delete file from S3');
          failure();
        });
    }

    switch(data.documentTemplate.documentTemplateId) {
      case 1:
        getCompanyDetails(baseRequest)
          .then(function(companyLogoPath) {
            getAttachments(baseRequest, data.documentId)
              .then(function(attachments) {
                data.attachments = attachments;
                data.companyLogoPath = companyLogoPath;
                html = fs.readFileSync('server/assets/templates/purchaseOrder.html', 'utf8');
                fillPOData(html, data);
              });
          });
        break;
      case 2:
        getCompanyDetails(baseRequest)
          .then(function(companyLogoPath) {
            getAttachments(baseRequest, data.documentId)
              .then(function(attachments) {
                data.attachments = attachments;
                data.companyLogoPath = companyLogoPath;
                html = fs.readFileSync('server/assets/templates/changeOrder.html', 'utf8');
                fillCOData(html, data);
              });
          });
        break;
      case 3:
        getCompanyDetails(baseRequest)
          .then(function(companyLogoPath) {
            // Get attachments
            getAttachments(baseRequest, data.documentId)
              .then(function(attachments) {
                data.companyLogoPath = companyLogoPath;
                data.attachments = attachments;
                html = fs.readFileSync('server/assets/templates/requestForInformation.html', 'utf8');
                fillRFIData(html, data);
              });
          });
        break;
      case 4:
        getCompanyDetails(baseRequest)
          .then(function(companyLogoPath) {
            getAttachments(baseRequest, data.documentId)
              .then(function(attachments) {
                data.attachments = attachments;
                data.companyLogoPath = companyLogoPath;
                html = fs.readFileSync('server/assets/templates/transmittal.html', 'utf8');
                fillTransData(html, data);
              });
          });
        break;
      default:
        res.status(404)        // HTTP status 404: NotFound
          .send('Document not found');
    }
  }
};