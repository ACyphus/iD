describe('iD.validations.crossing_ways', function () {
    var context;

    beforeEach(function() {
        context = iD.Context();
    });

    function createWaysWithOneCrossingPoint(tags1, tags2) {
        var n1 = iD.Node({id: 'n-1', loc: [1,1]});
        var n2 = iD.Node({id: 'n-2', loc: [2,2]});
        var w1 = iD.Way({id: 'w-1', nodes: ['n-1', 'n-2'], tags: tags1});

        context.perform(
            iD.actionAddEntity(n1),
            iD.actionAddEntity(n2),
            iD.actionAddEntity(w1)
        );

        var n3 = iD.Node({id: 'n-3', loc: [1,2]});
        var n4 = iD.Node({id: 'n-4', loc: [2,1]});
        var w2 = iD.Way({id: 'w-2', nodes: ['n-3', 'n-4'], tags: tags2});

        context.perform(
            iD.actionAddEntity(n3),
            iD.actionAddEntity(n4),
            iD.actionAddEntity(w2)
        );
    }

    function createWaysWithTwoCrossingPoint() {
      var n1 = iD.Node({id: 'n-1', loc: [1,1]});
      var n2 = iD.Node({id: 'n-2', loc: [3,3]});
      var w1 = iD.Way({id: 'w-1', nodes: ['n-1', 'n-2'], tags: { highway: 'residential' }});

      context.perform(
          iD.actionAddEntity(n1),
          iD.actionAddEntity(n2),
          iD.actionAddEntity(w1)
      );

      var n3 = iD.Node({id: 'n-3', loc: [1,2]});
      var n4 = iD.Node({id: 'n-4', loc: [2,1]});
      var n5 = iD.Node({id: 'n-5', loc: [3,2]});
      var n6 = iD.Node({id: 'n-6', loc: [2,3]});
      var w2 = iD.Way({id: 'w-2', nodes: ['n-3', 'n-4', 'n-5', 'n-6'], tags: { highway: 'residential' }});

      context.perform(
          iD.actionAddEntity(n3),
          iD.actionAddEntity(n4),
          iD.actionAddEntity(n5),
          iD.actionAddEntity(n6),
          iD.actionAddEntity(w2)
      );
    }

    function createHighwayCrossingRailway() {
        var n1 = iD.Node({id: 'n-1', loc: [1,1]});
        var n2 = iD.Node({id: 'n-2', loc: [2,2]});
        var w1 = iD.Way({id: 'w-1', nodes: ['n-1', 'n-2'], tags: { highway: 'residential' }});

        context.perform(
            iD.actionAddEntity(n1),
            iD.actionAddEntity(n2),
            iD.actionAddEntity(w1)
        );

        var n3 = iD.Node({id: 'n-3', loc: [1,2]});
        var n4 = iD.Node({id: 'n-4', loc: [2,1]});
        var w2 = iD.Way({id: 'w-2', nodes: ['n-3', 'n-4'], tags: { railway: 'rail' }});

        context.perform(
            iD.actionAddEntity(n3),
            iD.actionAddEntity(n4),
            iD.actionAddEntity(w2)
        );
    }

    function validate() {
        var validator = iD.validationHighwayCrossingOtherWays();
        var changes = context.history().changes();
        return validator(changes, context.graph(), context.history().tree());
    }

    function verifySingleCrossingIssue(issues) {
        expect(issues).to.have.lengthOf(1);
        var issue = issues[0];
        expect(issue.type).to.eql(iD.ValidationIssueType.crossing_ways);
        expect(issue.entities).to.have.lengthOf(2);
        expect(issue.entities[0].id).to.eql('w-1');
        expect(issue.entities[1].id).to.eql('w-2');

        expect(issue.coordinates).to.have.lengthOf(2);
        expect(issue.coordinates[0]).to.eql(1.5);
        expect(issue.coordinates[1]).to.eql(1.5);
    }

    it('has no errors on init', function() {
        var issues = validate();
        expect(issues).to.have.lengthOf(0);
    });

    // legit crossing cases
    it('legit crossing between highway and highway', function() {
        createWaysWithOneCrossingPoint({ highway: 'residential', tunnel: 'yes', layer: '-1' }, { highway: 'residential' });
        var issues = validate();
        expect(issues).to.have.lengthOf(0);
    });

    it('legit crossing between highway and railway', function() {
        createWaysWithOneCrossingPoint({ highway: 'residential' }, { railway: 'rail', bridge: 'yes' });
        var issues = validate();
        expect(issues).to.have.lengthOf(0);
    });

    it('legit crossing between highway and waterway', function() {
        createWaysWithOneCrossingPoint({ highway: 'residential', bridge: 'yes' }, { waterway: 'river' });
        var issues = validate();
        expect(issues).to.have.lengthOf(0);
    });

    it('legit crossing between highway and building', function() {
        createWaysWithOneCrossingPoint({ highway: 'residential', covered: 'yes' }, { building: 'yes' });
        var issues = validate();
        expect(issues).to.have.lengthOf(0);
    });

    it('legit crossing between railway and railway', function() {
        createWaysWithOneCrossingPoint({ railway: 'rail', layer: '1' }, { railway: 'rail' });
        var issues = validate();
        expect(issues).to.have.lengthOf(0);
    });

    it('legit crossing between railway and waterway', function() {
        createWaysWithOneCrossingPoint({ railway: 'rail' }, { waterway: 'river', tunnel: 'yes' });
        var issues = validate();
        expect(issues).to.have.lengthOf(0);
    });

    it('legit crossing between railway and building', function() {
        createWaysWithOneCrossingPoint({ railway: 'rail', covered: 'yes' }, { building: 'yes' });
        var issues = validate();
        expect(issues).to.have.lengthOf(0);
    });

    it('legit crossing between waterway and waterway', function() {
        createWaysWithOneCrossingPoint({ waterway: 'canal', tunnel: 'yes' }, { waterway: 'river' });
        var issues = validate();
        expect(issues).to.have.lengthOf(0);
    });

    it('legit crossing between waterway and building', function() {
        createWaysWithOneCrossingPoint({ waterway: 'river', covered: 'yes' }, { building: 'yes' });
        var issues = validate();
        expect(issues).to.have.lengthOf(0);
    });

    it('legit crossing between building and building', function() {
        createWaysWithOneCrossingPoint({ building: 'yes' }, { building: 'yes', covered: 'yes' });
        var issues = validate();
        expect(issues).to.have.lengthOf(0);
    });

    // warning crossing cases between ways
    it('one cross point between highway and highway', function() {
        createWaysWithOneCrossingPoint({ highway: 'residential' }, { highway: 'residential' });
        verifySingleCrossingIssue(validate());
    });

    it('one cross point between highway and railway', function() {
        createWaysWithOneCrossingPoint({ highway: 'residential' }, { railway: 'rail' });
        verifySingleCrossingIssue(validate());
    });

    it('one cross point between highway and waterway', function() {
        createWaysWithOneCrossingPoint({ highway: 'residential' }, { waterway: 'river' });
        verifySingleCrossingIssue(validate());
    });

    it('one cross point between highway and building', function() {
        createWaysWithOneCrossingPoint({ highway: 'residential' }, { building: 'yes' });
        verifySingleCrossingIssue(validate());
    });

    it('one cross point between railway and railway', function() {
        createWaysWithOneCrossingPoint({ railway: 'rail' }, { railway: 'rail' });
        verifySingleCrossingIssue(validate());
    });

    it('one cross point between railway and waterway', function() {
        createWaysWithOneCrossingPoint({ railway: 'rail' }, { waterway: 'river' });
        verifySingleCrossingIssue(validate());
    });

    it('one cross point between railway and building', function() {
        createWaysWithOneCrossingPoint({ railway: 'rail' }, { building: 'yes' });
        verifySingleCrossingIssue(validate());
    });

    it('one cross point between waterway and waterway', function() {
        createWaysWithOneCrossingPoint({ waterway: 'canal' }, { waterway: 'river' });
        verifySingleCrossingIssue(validate());
    });

    it('one cross point between waterway and building', function() {
        createWaysWithOneCrossingPoint({ waterway: 'river' }, { building: 'yes' });
        verifySingleCrossingIssue(validate());
    });

    it('one cross point between building and building', function() {
        createWaysWithOneCrossingPoint({ building: 'yes' }, { building: 'yes' });
        verifySingleCrossingIssue(validate());
    });

    it('two cross points between two highways', function() {
        createWaysWithTwoCrossingPoint();
        var issues = validate();
        expect(issues).to.have.lengthOf(2);
        var issue = issues[0];
        expect(issue.type).to.eql(iD.ValidationIssueType.crossing_ways);
        expect(issue.entities).to.have.lengthOf(2);
        expect(issue.entities[0].id).to.eql('w-1');
        expect(issue.entities[1].id).to.eql('w-2');

        expect(issue.coordinates).to.have.lengthOf(2);
        expect(issue.coordinates[0]).to.eql(1.5);
        expect(issue.coordinates[1]).to.eql(1.5);

        issue = issues[1];
        expect(issue.type).to.eql(iD.ValidationIssueType.crossing_ways);
        expect(issue.entities).to.have.lengthOf(2);
        expect(issue.entities[0].id).to.eql('w-1');
        expect(issue.entities[1].id).to.eql('w-2');

        expect(issue.coordinates).to.have.lengthOf(2);
        expect(issue.coordinates[0]).to.eql(2.5);
        expect(issue.coordinates[1]).to.eql(2.5);
    });

    function createWayAndRelationWithOneCrossingPoint(wayTags, relTags) {
        var n1 = iD.Node({id: 'n-1', loc: [1,1]});
        var n2 = iD.Node({id: 'n-2', loc: [2,2]});
        var w1 = iD.Way({id: 'w-1', nodes: ['n-1', 'n-2'], tags: wayTags});

        context.perform(
            iD.actionAddEntity(n1),
            iD.actionAddEntity(n2),
            iD.actionAddEntity(w1)
        );

        var n3 = iD.Node({id: 'n-3', loc: [1,2]});
        var n4 = iD.Node({id: 'n-4', loc: [2,1]});
        var n5 = iD.Node({id: 'n-5', loc: [3,2]});
        var n6 = iD.Node({id: 'n-6', loc: [2,3]});
        var w2 = iD.Way({id: 'w-2', nodes: ['n-3', 'n-4', 'n-5'], tags: {}});
        var w3 = iD.Way({id: 'w-3', nodes: ['n-5', 'n-6', 'n-3'], tags: {}});
        var r1 = iD.Relation({id: 'r-1', members: [{id: 'w-2'}, {id: 'w-3'}], tags: relTags});

        context.perform(
            iD.actionAddEntity(n3),
            iD.actionAddEntity(n4),
            iD.actionAddEntity(n5),
            iD.actionAddEntity(n6),
            iD.actionAddEntity(w2),
            iD.actionAddEntity(w3),
            iD.actionAddEntity(r1)
        );
    }

    // warning crossing cases between way and relation
    it('one cross point between highway and water relation', function() {
        createWayAndRelationWithOneCrossingPoint({ highway: 'residential' }, { natural: 'water' });
        verifySingleCrossingIssue(validate());
    });

    it('one cross point between railway and building relation', function() {
        createWayAndRelationWithOneCrossingPoint({ highway: 'residential' }, { building: 'yes' });
        verifySingleCrossingIssue(validate());
    });
});
