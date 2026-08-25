function doPost(e) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();

    if (!e || !e.postData || !e.postData.contents) {
      throw new Error('No POST data received');
    }

    var data = JSON.parse(e.postData.contents);

    sheet.appendRow([
      data.timestamp || new Date(),
      data.source || '',
      data.villa || '',
      data.name || '',
      data.phone ? "'" + data.phone : '',
      data.email || '',
      data.message || ''
    ]);

    return ContentService
      .createTextOutput(JSON.stringify({
        status: 'ok'
      }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({
        status: 'error',
        message: error.message
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}