function getWeatherDataAndSendToOpenAI() {
  // 구글 스프레드시트에서 기온 데이터를 가져옵니다.
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('시트1');
  var dataRange = sheet.getDataRange();
  var data = dataRange.getValues();
  
  // 평균 기온 계산을 위한 배열 생성
  var monthlyData = [];
  
  for (var i = 1; i < data.length; i++) {  // 첫 번째 행은 헤더이므로 제외
    var month = data[i][0];  // 월
    var highTemp = data[i][1];  // 최고 기온
    var lowTemp = data[i][2];  // 최저 기온
    
    // 평균 기온 계산
    var avgTemp = (highTemp + lowTemp) / 2;
    
    // 월별 데이터 배열에 추가
    monthlyData.push({
      month: month,
      avgTemp: avgTemp
    });
  }
  
  // 프롬프트 준비: 월별 평균 기온 데이터를 포함한 추세 질문
  var prompt = "여기 최근 1년 동안의 서울 월별 평균 기온 데이터가 있습니다:\n";
  monthlyData.forEach(function(entry) {
    prompt += entry.month + ": " + entry.avgTemp.toFixed(2) + "℃\n";
  });
  prompt += "이 데이터를 바탕으로 기온 변화 추세를 분석하고 설명해 주세요. 텍스트 강조없이 응답해주시면 됩니다.";
  
  // OpenAI API 호출 준비
  //var apiKey = PropertiesService.getScriptProperties().getProperty('OPENAI_API_KEY'); // API 키를 안전하게 가져오기
  var apiKey = '[YOUR_OPENAPI_KEY_HERE]'; 
  var apiUrl = 'https://api.openai.com/v1/chat/completions';
  
  var options = {
    'method': 'POST',
    'headers': {
      'Authorization': 'Bearer ' + apiKey,
      'Content-Type': 'application/json'
    },
    'payload': JSON.stringify({
      'model': 'gpt-4o',  // 모델을 gpt-4로 유지
      'messages': [
        {'role': 'system', 'content': '당신은 도움이 되는 나의 비서입니다.'},
        {'role': 'user', 'content': prompt}
      ],
      'max_tokens': 1000
    })
  };
  
  // OpenAI API 호출
  var response = UrlFetchApp.fetch(apiUrl, options);
  var result = JSON.parse(response.getContentText());
  
  // OpenAI 응답을 시트에 출력
  var outputSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Output');
  if (!outputSheet) {
    outputSheet = SpreadsheetApp.getActiveSpreadsheet().insertSheet('Output');
  }
  outputSheet.clear();
  outputSheet.getRange(1, 1).setValue('OpenAI의 분석 결과:');
  outputSheet.getRange(2, 1).setValue(result.choices[0].message.content.trim());
}
