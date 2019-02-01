import { t } from '../util/locale';
import {
    utilDisplayLabel
} from '../util';
import {
    ValidationIssueType,
    ValidationIssueSeverity,
    validationIssue,
    validationIssueFix
} from '../core/validator';
import { operationDelete } from '../operations/index';
import { modeDrawLine } from '../modes';

export function validationDisconnectedWay() {

    function isDisconnectedHighway(entity, graph) {
        if (!entity.tags.highway) return false;
        if (entity.geometry(graph) !== 'line') return false;

        return graph.childNodes(entity)
            .every(function(vertex) {
                var parents = graph.parentWays(vertex);
                if (parents.length === 1) {  // standalone vertex
                    return true;
                } else {                     // shared vertex
                    return !vertex.tags.entrance &&
                        parents.filter(function(parent) {
                            return parent.tags.highway && parent !== entity;
                        }).length === 0;
                }
            });
    }


    var validation = function(entity, context) {
        var issues = [];
        var graph = context.graph();
        if (isDisconnectedHighway(entity, graph)) {
            var entityLabel = utilDisplayLabel(entity, context);

            issues.push(new validationIssue({
                type: ValidationIssueType.disconnected_way,
                severity: ValidationIssueSeverity.warning,
                message: t('issues.disconnected_way.highway.message', { highway: entityLabel }),
                tooltip: t('issues.disconnected_way.highway.tip'),
                entities: [entity],
                fixes: [
                    new validationIssueFix({
                        title: t('issues.fix.continue_feature.title'),
                        onClick: function() {
                            var way = this.issue.entities[0];
                            var childNodes = context.graph().childNodes(way);
                            var endNodes = [childNodes[0], childNodes[childNodes.length-1]];
                            var exclusiveEndNodes = endNodes.filter(function(vertex) {
                                return graph.parentWays(vertex).length === 1;
                            });
                            var vertex;
                            if (exclusiveEndNodes.length === 1) {
                                // prefer an endpoint with no connecting ways
                                vertex = exclusiveEndNodes[0];
                            } else {
                                // prefer the terminating node
                                vertex = endNodes[1];
                            }
                            context.enter(
                                modeDrawLine(context, way.id, context.graph(), way.affix(vertex.id), true)
                            );
                        }
                    }),
                    new validationIssueFix({
                        title: t('issues.fix.delete_feature.title'),
                        onClick: function() {
                            var id = this.issue.entities[0].id;
                            operationDelete([id], context)();
                        }
                    })
                ]
            }));
        }

        return issues;
    };

    validation.type = ValidationIssueType.disconnected_way;

    return validation;
}
