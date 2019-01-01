"use strict";
exports.__esModule = true;
var MultiLang = /** @class */ (function () {
    /**
     * Constructor
     * @param files list of paths to language files, which internally should be formatted as JSON
     * @param main main language file to use, but not it's path, and excluding it's extension
     */
    function MultiLang(files, main) {
        var _this = this;
        /** Internal variable for storing currently active language */
        this.active = null;
        /** Internal variable for storing multilang elements */
        this.elements = [];
        /** Internal variable for storing file paths. */
        this.files = {};
        /** Internal variable for storing language objects */
        this.languages = {};
        /** Internal variable for storing the default language */
        this.main = null;
        // Assign main if available
        if (main !== null && main !== undefined)
            this.main = main;
        // Find the file name
        files.forEach(function (file, i) {
            var name = _this.addLanguage(file);
            if (name !== null && _this.main === null && (files.length === 1 || i === files.length - 1 || name === 'en' || name === 'eng' || name === 'english'))
                _this.main = name;
        });
        // Find the initial MultiLang targets
        this.retarget();
        // Load the main language if provided
        if (this.main !== null)
            this.swap(this.main);
    }
    /**
     * Adds a language
     * @param file Path to the langauge file, which internally should be formatted as JSON
     * @returns string target name for langauge
     */
    MultiLang.prototype.addLanguage = function (file) {
        var filename = file.substring(file.lastIndexOf('/') + 1, file.lastIndexOf('.'));
        if (Object.keys(this.files).indexOf(filename) !== -1) {
            console.warn("[MultiLang] Can't add language with already added existing name '" + filename + "'.");
            return null;
        }
        this.files[filename] = file;
        return filename;
    };
    /**
     * Reload targets for MultiLang
     * @param parent Reload only decendents from this element. (Default to html element)
     */
    MultiLang.prototype.retarget = function (parent) {
        if (parent === null || parent === undefined)
            parent = document.getElementsByTagName('html')[0];
        for (var i = 0; i < parent.children.length; i++) {
            var child = parent.children[i];
            if (child.hasAttribute('multilang'))
                child.textContent = this.resolveTarget(child.getAttribute('multilang'));
        }
    };
    /**
     * Resolves a target string to find the correct element in an object
     * @param target Target string to resolve
     * @param fromLanguage language to get target from (defaults to active)
     */
    MultiLang.prototype.resolveTarget = function (target, fromLanguage) {
        var targetlist = target.split(/\.\//gi);
        var obj = this.languages[fromLanguage || this.active || this.main];
        while (targetlist.length > 0) {
            var next = targetlist.shift();
            if (typeof (obj[next]) === 'object')
                obj = obj[next];
            else
                return obj[next];
        }
    };
    /**
     * List the languages added.
     * @param paths Optional, returns an object with languages and their respective paths.
     */
    MultiLang.prototype.list = function (paths) {
        if (paths === void 0) { paths = false; }
        if (paths)
            return this.files;
        else
            return Object.keys(this.files);
    };
    /**
     * Updates/refreshes all multilang elements.
     */
    MultiLang.prototype.refresh = function () {
        var _this = this;
        this.elements.forEach(function (el) {
            el.textContent = _this.resolveTarget(el.getAttribute('mutlilang'));
        });
    };
    /**
     * Switch to a different language file
     * @param target Target language file to switch to, but not it's path, and excluding it's extension
     * @param retarget Reload multilang's target elements
     * @param reaquire Reload the langauge file (defaults to false)
     * @param callback Optional callback function, with boolean parameter for success or error.
     */
    MultiLang.prototype.swap = function (target, retarget, reaquire, callback) {
        var _this = this;
        if (retarget === void 0) { retarget = false; }
        if (reaquire === void 0) { reaquire = false; }
        if (Object.keys(this.files).indexOf(target) === -1) {
            console.warn("[MultiLang] No language file for target '" + target + "' was defined. Add it with '.addLanguage(file)', or get the list with '.list()'");
            return;
        }
        if (this.languages[target] === null || this.languages[target] === undefined)
            reaquire = true;
        this.active = target;
        if (retarget)
            this.retarget();
        if (reaquire === false) {
            this.refresh();
            if (callback !== null && callback !== undefined)
                callback(true);
        }
        else {
            var xmlhttp_1 = new XMLHttpRequest();
            xmlhttp_1.overrideMimeType('application/json');
            xmlhttp_1.open('GET', this.files[target]);
            xmlhttp_1.onreadystatechange = function () {
                if (xmlhttp_1.status === 200) {
                    _this.refresh();
                    if (callback !== null && callback !== undefined)
                        callback(true);
                }
            };
            xmlhttp_1.onerror = function () {
                console.warn("[MultiLang] Failed to get langaugefile, failed with error: '" + xmlhttp_1.statusText + "'");
                callback(false);
            };
            xmlhttp_1.send();
        }
    };
    return MultiLang;
}());
exports["default"] = MultiLang;
