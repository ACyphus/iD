import { services } from '../services';
import {
    ValidationIssueType
} from '../core/validator';
export function validationMaprules() {
    var validation = function(entity, context) {
        if (!services.maprules) return [];

        var graph = context.graph();

        var rules = services.maprules.validationRules();
        var issues = [];

        for (var i = 0; i < rules.length; i++) {
            var rule = rules[i];
            rule.findIssues(entity, graph, issues);
        }

        return issues;
    };

    validation.type = ValidationIssueType.maprules;

    return validation;
}
