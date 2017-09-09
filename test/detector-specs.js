var chai = require('chai');
var chaiAsPromised = require("chai-as-promised");
var should = chai.should();
var md = require('t-motion-detector');
var speech = require('t-motion-detector-speech');

//Chai will use promises for async events
chai.use(chaiAsPromised);

describe("When I try to add a new Detector without and environment", function() {
  it('should throw an exception.', function (done) {
    //Prepare
    try{
      md.AddDetector(new md.Extensions.PIRMotionDetector(17));
    } catch(e){
      e.message.should.equal('No environment was detected, please add one first.');
      done();
    }
    should.fail();
  });
});

describe("When I create a new PIR Detector", function() {
  it('it should contain the "startMonitoring" function.', function (done) {
    //Prepare
    pir = new md.Extensions.PIRMotionDetector(17);
    console.log(pir);
    pir.startMonitoring.should.not.equal(undefined);
    done();
  });
});

describe("When I start a new t-motion-sensor with an Extension Motion detector", function() {
  it('should not throw any exception.', function (done) {
    //Prepare
    md.Start();
    md.AddDetector(new md.Extensions.PIRMotionDetector(17));
    md.GetEnvironment().should.not.equal(undefined);
    done();
  });
});

describe("A really very very basic test to assert that a t-motion-detector exists and", function() {

  it('initial state of motion detector count should be 0.', function () {
    
    md.count.should.equal(0);
  });

  it('should allow adding a particular notifier to inform a change was made in this case a Start event', function () {
    //This is really just an academic test, BaseNotifier does nothing
    var someNotifier = new md.Entities.BaseNotifier()
    md.AddNotifier(someNotifier);
 
    someNotifier.on('pushedNotification', function(message, text){
        console.log("A new notification has arrived!", message, text);
        chai.assert.isOk("Everything is ok");
    });

    md.Start();
    //Check that an initial event happened (there is always a change for the first time because a new environment
    //always detects a new change by default when it starts; 
  });

  it('should notify in case it is removed from the notifiers list, and text should be "Removing Notifier..."', function () {
    //This is really just an academic test, BaseNotifier does nothing
    var someNotifier = new md.Entities.BaseNotifier()
    md.AddNotifier(someNotifier);
 
    someNotifier.on('pushedNotification', function(message, text){
        console.log("A new notification has arrived!", message, text);
        text.should.equal("Removing Notifier...");
    });

    md.RemoveNotifier(someNotifier);
    //Check that an initial event happened (there is always a change for the first time because a new environment
    //always detects a new change by default when it starts; 
  });
});

describe("When a t-motion-detector with speech exists", function() {

  it('should use the speech capabilities via dependency injection.', function () {
    md.Use(speech); //Use late binding here (abstract entity)
    md.Start();
  });

  it('should use the speech capabilities via manipulating the parent object.', function () {
    speech.UseIn(md); //Use late binding here (abstract entity)
    md.Start();
  });

  it('should use the speech capabilities, by adding explicitely a speech notifier.', function () {
    var voiceNotifier = new speech.SpeechNotifier();
    md.AddNotifier(voiceNotifier);

    voiceNotifier.on('pushedNotification', function(message, text){
      console.log("A new notification has arrived!", message, text);
      chai.assert.isOk("Everything is ok");
    });

    md.Start();
  });
});

describe("When I start a new t-motion-sensor with a custom Environment as parameter, ", function() {
  it('should assign that Environment and not the default one.', function (done) {
    //Prepare
    md.Start({
      environment: new md.Entities.Environment({
        name: 'My Environment',
      })
    });
    md.GetEnvironment().name.should.not.equal("No name");
    done();   
  });
});

describe("When I start a new t-motion-sensor with a SlackNotifier, ", function() {
  it('should send a slack message when movement is detected.', function (done) {
    var env = new md.Entities.Environment();
    var detector = new md.Entities.MotionDetector();
    var notifier = new md.Extensions.SlackNotifier("My Slack", "https://hooks.slack.com/services/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");
    console.log("Created", env);

    notifier.on("pushedNotification", function(name, text){
      chai.assert.isOk("notified");
      console.log(`Got a notification from ${name}: ${text}`);
      done();
    });

    md.Start({
      environment: env,
      initialMotionDetector: detector,
      initialNotifier: notifier
    });
    detector.send(1);
  });
});
