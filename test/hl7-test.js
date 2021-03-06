// --------------------------------------------------------------------------
// test/hl7Test.js
// --------------------------------------------------------------------------

var expect   = require('chai').expect;
var deepeql  = require('deep-equal');

//--------------------------------------------------------------------------

var hl7 = require('../lib/hl7');

//--------------------------------------------------------------------------

describe('HL7 Util Functions', function() {
    describe('parseString()', function() {
        it('should parse a legit ADT message string', function(done) {
            var hl7String =
                "MSH|^~\\&|SNDAPPL|snd_fac|RECAPPL|rec_fac|20070208165451.447- 0500||ADT^A03|110A35A09B785|P|2.5\r" +
                "EVN|A03|200702080406|||PointClickCare|200702080406\r" +
                "PID|1||99269^^^^FI~123321^^^^PI||Berk^Ailsa||19400503|F|||579 5 PointClickCare Street^^Lakeview^OH^90210||^PRN^PH^^^^^^^^^(937) 8432794|||||04254|275-32-9550\r" +
                "PV1|1|N|100^104^A^ABC2PREV0021^^N^100^1||||G45670 ^Haenel^Mary- Ann|||||||||||0||||||||||||||||||||||||||20070207 0403-0500|200702080406-0500\r" +
                "ZEV|2001|200702080406|PointClickCare";

            hl7.parseString(hl7String, function(err, parsedMessage) {
                expect(err).to.be.null;
                expect(parsedMessage).to.not.equal(null);
                expect(deepeql(parsedMessage.segmentTypes, ['MSH', 'EVN', 'PID', 'PV1', 'ZEV'])).to.be.true;
                done();
            });
        });
        it('should parse a message string, even if it is not a legit ADT message', function(done) {
            var hl7String =
                "MSH|^~\\&|SNDAPPL|snd_fac|RECAPPL|rec_fac|20070208165451.447- 0500||ADT^A03|110A35A09B785|P|2.5\r" +
                "PID|1||99269^^^^FI~123321^^^^PI||Berk^Ailsa||19400503|F|||579 5 PointClickCare Street^^Lakeview^OH^90210||^PRN^PH^^^^^^^^^(937) 8432794|||||04254|275-32-9550\r" +
                "ZEV|2001|200702080406|PointClickCare";

            hl7.parseString(hl7String, function(err, parsedMessage) {
                expect(err).to.be.null;
                expect(parsedMessage).to.not.equal(null);
                expect(deepeql(parsedMessage.segmentTypes, ['MSH', 'PID', 'ZEV'])).to.be.true;
                done();
            });
        });
        it('should fail if the message is not valid', function(done) {
            var hl7String =
                "MSH|^~\\&|SNDAPPL|snd_fac|RECAPPL|rec_fac|20070208165451.447- 0500||ADT^A03|110A35A09B785|P|2.5\r" +
                "EVN|A03|200702080406|||PointClickCare|200702080406\r" +
                "PID|1||99269^^^^FI~123321^^^^PI||Berk^Ailsa||19400503|F|||579 5 PointClickCare Street^^Lakeview^OH^90210||^PRN^PH^^^^^^^^^(937) 8432794|||||04254|275-32-9550\r" +
                "blaaaaaah\r" +
                "ZEV|2001|200702080406|PointClickCare";

            hl7.parseString(hl7String, function(err, parsedMessage) {
                expect(err).to.not.equal(null);
                expect(parsedMessage).to.be.undefined;
                done();
            });
        });
    });
    describe('hasSegment()', function() {
        it('should return true for included segments, false for anything else', function(done) {
            var hl7String =
                "MSH|^~\\&|SNDAPPL|snd_fac|RECAPPL|rec_fac|20070208165451.447- 0500||ADT^A03|110A35A09B785|P|2.5\r" +
                "EVN|A03|200702080406|||PointClickCare|200702080406\r" +
                "PID|1||99269^^^^FI~123321^^^^PI||Berk^Ailsa||19400503|F|||579 5 PointClickCare Street^^Lakeview^OH^90210||^PRN^PH^^^^^^^^^(937) 8432794|||||04254|275-32-9550\r" +
                "PV1|1|N|100^104^A^ABC2PREV0021^^N^100^1||||G45670 ^Haenel^Mary- Ann|||||||||||0||||||||||||||||||||||||||20070207 0403-0500|200702080406-0500\r" +
                "ZEV|2001|200702080406|PointClickCare";

            hl7.parseString(hl7String, function(err, parsedMessage) {
                expect(err).to.be.null;
                expect(hl7.hasSegment('MSH', parsedMessage)).to.be.true;
                expect(hl7.hasSegment('EVN', parsedMessage)).to.be.true;
                expect(hl7.hasSegment('PID', parsedMessage)).to.be.true;
                expect(hl7.hasSegment('PV1', parsedMessage)).to.be.true;
                expect(hl7.hasSegment('ZEV', parsedMessage)).to.be.true;

                expect(hl7.hasSegment('FOO', parsedMessage)).to.be.false;
                expect(hl7.hasSegment('BAR', parsedMessage)).to.be.false;
                expect(hl7.hasSegment('BAZ', parsedMessage)).to.be.false;
                expect(hl7.hasSegment('ZIP', parsedMessage)).to.be.false;

                done();
            });
        });

        it('should return true for segments included once if onlyOnce set, false otherwise', function(done) {
            var hl7String =
                "MSH|^~\\&|SNDAPPL|snd_fac|RECAPPL|rec_fac|20070208165451.447- 0500||ADT^A03|110A35A09B785|P|2.5\r" +
                "EVN|A03|200702080406|||PointClickCare|200702080406\r" +
                "EVN|A03|200702080406|||PointClickCare|200702080406\r" +
                "PID|1||99269^^^^FI~123321^^^^PI||Berk^Ailsa||19400503|F|||579 5 PointClickCare Street^^Lakeview^OH^90210||^PRN^PH^^^^^^^^^(937) 8432794|||||04254|275-32-9550\r" +
                "PV1|1|N|100^104^A^ABC2PREV0021^^N^100^1||||G45670 ^Haenel^Mary- Ann|||||||||||0||||||||||||||||||||||||||20070207 0403-0500|200702080406-0500\r" +
                "ZEV|2001|200702080406|PointClickCare";

            hl7.parseString(hl7String, function(err, parsedMessage) {
                expect(err).to.be.null;
                expect(hl7.hasSegment('EVN', parsedMessage)).to.be.true;
                expect(hl7.hasSegment('EVN', parsedMessage, true)).to.be.false;

                done();
            });
        });
    });

    describe('getSegmentOfType()', function() {
        it('should return segment if found, null if not found when requesting single segment', function(done) {
            var hl7String =
                "MSH|^~\\&|SNDAPPL|snd_fac|RECAPPL|rec_fac|20070208165451.447- 0500||ADT^A03|110A35A09B785|P|2.5\r" +
                "EVN|A03|200702080406|||PointClickCare|200702080406\r" +
                "PID|1||99269^^^^FI~123321^^^^PI||Berk^Ailsa||19400503|F|||579 5 PointClickCare Street^^Lakeview^OH^90210||^PRN^PH^^^^^^^^^(937) 8432794|||||04254|275-32-9550\r" +
                "PV1|1|N|100^104^A^ABC2PREV0021^^N^100^1||||G45670 ^Haenel^Mary- Ann|||||||||||0||||||||||||||||||||||||||20070207 0403-0500|200702080406-0500\r" +
                "ZEV|2001|200702080406|PointClickCare";

            hl7.parseString(hl7String, function(err, parsedMessage) {
                expect(err).to.be.null;

                var segment = hl7.getSegmentOfType('MSH', parsedMessage);
                expect(segment).to.not.equal(null);
                expect(segment.parsed.SegmentType).to.equal('MSH');

                segment = hl7.getSegmentOfType('ZEV', parsedMessage);
                expect(segment).to.not.equal(null);
                expect(segment.parsed.SegmentType).to.equal('ZEV');

                expect(hl7.getSegmentOfType('FOO', parsedMessage)).to.be.null;
                expect(hl7.getSegmentOfType('BAR', parsedMessage)).to.be.null;
                expect(hl7.getSegmentOfType('BAZ', parsedMessage)).to.be.null;
                expect(hl7.getSegmentOfType('ZIP', parsedMessage)).to.be.null;

                done();
            });
        });

        it('should return first segment if there are multiple', function(done) {
            var hl7String =
                "MSH|^~\\&|SNDAPPL|snd_fac|RECAPPL|rec_fac|20070208165451.447- 0500||ADT^A03|110A35A09B785|P|2.5\r" +
                "EVN|A03|200702080406|||PointClickCare|200702080406\r" +
                "PID|1||99269^^^^FI~123321^^^^PI||Berk^Ailsa||19400503|F|||579 5 PointClickCare Street^^Lakeview^OH^90210||^PRN^PH^^^^^^^^^(937) 8432794|||||04254|275-32-9550\r" +
                "PV1|1|N|100^104^A^ABC2PREV0021^^N^100^1||||G45670 ^Haenel^Mary- Ann|||||||||||0||||||||||||||||||||||||||20070207 0403-0500|200702080406-0500\r" +
                "PV1|2|N|100^104^A^ABC2PREV0021^^N^100^1||||G45670 ^Haenel^Mary- Ann|||||||||||0||||||||||||||||||||||||||20070207 0403-0500|200702080406-0500\r" +
                "PV1|3|N|100^104^A^ABC2PREV0021^^N^100^1||||G45670 ^Haenel^Mary- Ann|||||||||||0||||||||||||||||||||||||||20070207 0403-0500|200702080406-0500\r" +
                "ZEV|2001|200702080406|PointClickCare";

            hl7.parseString(hl7String, function(err, parsedMessage) {
                expect(err).to.be.null;

                var segment = hl7.getSegmentOfType('PV1', parsedMessage);
                expect(segment).to.not.equal(null);
                expect(segment.parsed.SegmentType).to.equal('PV1');
                expect(segment.parsed.SetID).to.equal('1');

                done();
            });
        });
    });

    describe('getAllSegmentsOfType()', function() {
        var hl7String =
            "MSH|^~\\&|SNDAPPL|snd_fac|RECAPPL|rec_fac|20070208165451.447- 0500||ADT^A03|110A35A09B785|P|2.5\r" +
            "EVN|A03|200702080406|||PointClickCare|200702080406\r" +
            "PID|1||99269^^^^FI~123321^^^^PI||Berk^Ailsa||19400503|F|||579 5 PointClickCare Street^^Lakeview^OH^90210||^PRN^PH^^^^^^^^^(937) 8432794|||||04254|275-32-9550\r" +
            "PV1|1|N|100^104^A^ABC2PREV0021^^N^100^1||||G45670 ^Haenel^Mary- Ann|||||||||||0||||||||||||||||||||||||||20070207 0403-0500|200702080406-0500\r" +
            "PV1|2|N|100^104^A^ABC2PREV0021^^N^100^1||||G45670 ^Haenel^Mary- Ann|||||||||||0||||||||||||||||||||||||||20070207 0403-0500|200702080406-0500\r" +
            "PV1|3|N|100^104^A^ABC2PREV0021^^N^100^1||||G45670 ^Haenel^Mary- Ann|||||||||||0||||||||||||||||||||||||||20070207 0403-0500|200702080406-0500\r" +
            "ZEV|2001|200702080406|PointClickCare";

        it('should return multiple found segments in an array', function(done) {
            hl7.parseString(hl7String, function(err, parsedMessage) {
                expect(err).to.be.null;

                var segments = hl7.getAllSegmentsOfType('PV1', parsedMessage, true);
                expect(segments).to.not.equal(null);
                expect(segments).to.be.instanceof(Array);
                expect(segments).to.have.lengthOf(3);
                expect(segments[0].parsed.SegmentType).to.equal('PV1');
                expect(segments[0].parsed.SetID).to.equal('1');
                expect(segments[1].parsed.SegmentType).to.equal('PV1');
                expect(segments[1].parsed.SetID).to.equal('2');
                expect(segments[2].parsed.SegmentType).to.equal('PV1');
                expect(segments[2].parsed.SetID).to.equal('3');

                done();
            });
        });

        it('should still return an array even if it finds just one segment', function(done) {
            hl7.parseString(hl7String, function(err, parsedMessage) {
                expect(err).to.be.null;

                var segments = hl7.getAllSegmentsOfType('MSH', parsedMessage, true);
                expect(segments).to.not.equal(null);
                expect(segments).to.be.instanceof(Array);
                expect(segments).to.have.lengthOf(1);
                expect(segments[0].parsed.SegmentType).to.equal('MSH');

                done();
            });
        });

        it('should return an empty array if no segments found', function(done) {
            hl7.parseString(hl7String, function(err, parsedMessage) {
                expect(err).to.be.null;

                var segments = hl7.getAllSegmentsOfType('FOO', parsedMessage, true);
                expect(segments).to.not.equal(null);
                expect(segments).to.be.instanceof(Array);
                expect(segments).to.have.lengthOf(0);

                done();
            });
        });
    });

    describe('splitDataField()', function() {
        it('should just return the field if it is not splittable', function(done) {
            expect(hl7.splitDataField('This should not split up')).to.equal('This should not split up');
            done();
        });
        it('should split on component separator', function(done) {
            var chunks = hl7.splitDataField('Lewis^Jerry^Lee');
            expect(chunks).to.be.an.array;
            expect(chunks).to.have.length(3);
            expect(chunks[0]).to.equal('Lewis');
            expect(chunks[1]).to.equal('Jerry');
            expect(chunks[2]).to.equal('Lee');
            done();
        });
        it('should split on repetition then component separator', function(done) {
            var chunks = hl7.splitDataField('Lewis^Jerry^Lee~Redding^Ottis');
            expect(chunks).to.be.an.array;
            expect(chunks).to.have.length(2);
            expect(chunks[0]).to.have.length(3);
            expect(chunks[0][0]).to.equal('Lewis');
            expect(chunks[0][1]).to.equal('Jerry');
            expect(chunks[0][2]).to.equal('Lee');
            expect(chunks[1]).to.have.length(2);
            expect(chunks[1][0]).to.equal('Redding');
            expect(chunks[1][1]).to.equal('Ottis');
            done();
        });
        it('should split on custom separators', function(done) {
            var chunks = hl7.splitDataField('Lewis#Jerry#Lee%Redding#Ottis', '#', '%');
            expect(chunks).to.be.an.array;
            expect(chunks).to.have.length(2);
            expect(chunks[0]).to.have.length(3);
            expect(chunks[0][0]).to.equal('Lewis');
            expect(chunks[0][1]).to.equal('Jerry');
            expect(chunks[0][2]).to.equal('Lee');
            expect(chunks[1]).to.have.length(2);
            expect(chunks[1][0]).to.equal('Redding');
            expect(chunks[1][1]).to.equal('Ottis');
            done();
        });
    });
});