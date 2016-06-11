// required modules
// "lodash/underscore"
// "text.js": requireJS plugin to load html content dynamically
// "templates": An empty module which holds the template contents dynamically whenever a template is loaded

define(function() {
    return {
        loadTemplate: function(templateName, callbackFunc){
            var _this = this;

            require(['underscore'], function(_){
                // merging the main template, templates variable and template dependencies
                var requiredTemplates = _.union([templateName], _this.getTemplateDependencies(templateName));
                var dependencies = _.union(['templates'], _this.getTemplatePaths(requiredTemplates));
                // if the template had dependencies on other templates then load these other templates first
                require(dependencies, function(templates, templateContent){
                    // Storing the fetched template contents in an object for future use
                    for(var i = 0, ilen = requiredTemplates.length; i < ilen; i++){
                        templates[requiredTemplates[i]] = arguments[i + 1]; // the first argument of arguments holds templates variable
                    }
                    // storing templates variable inside the sandbox
                    _this.templates = templates;
                    // Calling the callback function
                    if(callbackFunc){
                        callbackFunc(templateContent);
                    }
                });
            });
        },
        getTemplatePaths: function(requiredTemplates){
            // Cloning to not alter the passed argument
            var allTemplates = _.clone(requiredTemplates);
            // Placing exact path along with textjs to fetch the templates dynamically
            for(var i = 0, ilen = allTemplates.length; i < ilen; i++){
                // Exact relative path
                allTemplates[i] = 'text!templates/' + allTemplates[i] + '.html';
            }
            return allTemplates;
        },
        // returns array of dependencies
        getTemplateDependencies: function(templateName){
            // dependency tree for each template
            var dependencyTree = {
                'some-template': ['dependencies', 'here'],
                'fields/textbox': ['fields/attributes'],
                'fields/select': ['fields/attributes'],
                'fields/textarea': ['fields/attributes'],
                'session-items': ['fields/textbox', 'fields/select', 'fields/textarea']
            }
            
            // The hierarchy of dependencies can go deeper like 2 or more levels
            // So, calling a recursive function which grabs dependency templates and check further for their dependencies
            // Atlast, all dependencies will be fetched in a single dimensional array
            return this.recursivelyAddDeps(dependencyTree, dependencyTree[templateName] || []);
        },
        recursivelyAddDeps(dependencyTree, dependencies) {
            var _this = this;
            return dependencies.reduce(function (accum, key) {
                return [].concat(accum, [key], dependencyTree[key] ? _this.recursivelyAddDeps(dependencyTree, dependencyTree[key]) : []);
            }, []);
        },
        setTemplate: function(str, data){
            // This method will only be used by templates to call other dependent templates
            var data = data || {};
            if(this.templates){
                return _.template(this.templates[str])({
                    data: data,
                    sb: this
                });
            }
            return "Template Not found";
        },
    }
});
