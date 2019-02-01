import _clone from 'lodash-es/clone';
import { t } from '../util/locale';
import {
    utilDisplayLabel,
    utilTagText
} from '../util';
import {
    ValidationIssueType,
    ValidationIssueSeverity,
    validationIssue,
    validationIssueFix
} from '../core/validator';
import {
    actionChangeTags
} from '../actions';


export function validationDeprecatedTag() {

    var validation = function(change, context) {
        var issues = [];
        var deprecatedTagsArray = change.deprecatedTags();
        if (deprecatedTagsArray.length > 0) {
            for (var deprecatedTagIndex in deprecatedTagsArray) {
                var deprecatedTags = deprecatedTagsArray[deprecatedTagIndex];
                var tagsLabel = utilTagText({ tags: deprecatedTags.old });
                var featureLabel = utilDisplayLabel(change, context);
                issues.push(new validationIssue({
                    type: ValidationIssueType.deprecated_tags,
                    severity: ValidationIssueSeverity.warning,
                    message: t('issues.deprecated_tags.message', { feature: featureLabel, tags: tagsLabel }),
                    tooltip: t('issues.deprecated_tags.tip'),
                    entities: [change],
                    hash: tagsLabel,
                    info: {
                        oldTags: deprecatedTags.old,
                        replaceTags: deprecatedTags.replace
                    },
                    fixes: [
                        new validationIssueFix({
                            title: t('issues.fix.upgrade_tags.title'),
                            onClick: function() {
                                var entity = this.issue.entities[0];
                                var tags = _clone(entity.tags);
                                var replaceTags = this.issue.info.replaceTags;
                                var oldTags = this.issue.info.oldTags;
                                var transferValue;
                                for (var oldTagKey in oldTags) {
                                    if (oldTags[oldTagKey] === '*') {
                                        transferValue = tags[oldTagKey];
                                    }
                                    delete tags[oldTagKey];
                                }
                                for (var replaceKey in replaceTags) {
                                    var replaceValue = replaceTags[replaceKey];
                                    if (replaceValue === '*') {
                                        if (tags[replaceKey]) {
                                            // any value is okay and there already
                                            // is one, so don't update it
                                            continue;
                                        } else {
                                            // otherwise assume `yes` is okay
                                            tags[replaceKey] = 'yes';
                                        }
                                    } else if (replaceValue === '$1') {
                                        tags[replaceKey] = transferValue;
                                    } else {
                                        tags[replaceKey] = replaceValue;
                                    }
                                }
                                context.perform(
                                    actionChangeTags(entity.id, tags),
                                    t('issues.fix.upgrade_tags.undo_redo')
                                );
                            }
                        })
                    ]
                }));
            }
        }

        return issues;
    };

    validation.type = ValidationIssueType.deprecated_tag;

    return validation;
}
