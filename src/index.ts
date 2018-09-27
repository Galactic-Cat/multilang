export default class MultiLang {
    /** Internal variable for storing currently active language */
    active: string = null
    /** Internal variable for storing multilang elements */
    elements: Element[] = []
    /** Internal variable for storing file paths. */
    files: object = {}
    /** Internal variable for storing language objects */
    languages: object = {}
    /** Internal variable for storing the default language */
    main: string = null

    /**
     * Constructor
     * @param files list of paths to language files, which internally should be formatted as JSON
     * @param main main language file to use, but not it's path, and excluding it's extension
     */
    constructor(files: string[], main?: string) {
        // Assign main if available
        if (main !== null && main !== undefined)
            this.main = main

        // Find the file name
        files.forEach((file, i) => {
            let name = file.substring(file.lastIndexOf('/') + 1, file.lastIndexOf('.'))
            if (this.main === null && (files.length === 1 || i === files.length - 1 || name === 'en' || name === 'eng' || name === 'english'))
                this.main = name
        })

        // Load the main language if provided
        if (this.main !== null)
            this.swap(this.main)
    }

    /**
     * Adds a language
     * @param file Path to the langauge file, which internally should be formatted as JSON
     * @returns string target name for langauge
     */
    public AddLanguage(file) : string {
        let filename = file.substring(file.lastIndexOf('/') + 1, file.lastIndexOf('.'))
        this.languages[filename] = file
        return filename
    }

    /**
     * Reload targets for MultiLang
     * @param parent Reload only decendents from this element. (Default to html element)
     */
    public retarget(parent?: Element) : void {
        if (parent === null || parent === undefined)
            parent = document.getElementsByTagName('html')[0]
        
        for (let i = 0; i < parent.children.length; i++) {
            let child = parent.children[i]
            if (child.hasAttribute('multilang'))
                child.textContent = this.resolveTarget(child.getAttribute('multilang'))
        }
    }

    /**
     * Resolves a target string to find the correct element in an object
     * @param target Target string to resolve
     * @param fromLanguage language to get target from (defaults to active)
     */
    private resolveTarget(target: string, fromLanguage?: string) : string {
        let targetlist = target.split(/\.\//gi)
        let obj = this.languages[fromLanguage || this.active || this.main]

        while (targetlist.length > 0) {
            let next = targetlist.shift()
            if (typeof(obj[next]) === 'object')
                obj = obj[next]
            else
                return obj[next]
        }
    }

    /**
     * List the languages added.
     * @param paths Optional, returns an object with languages and their respective paths.
     */
    public list(paths = false) : object | string[] {
        if (paths)
            return this.files
        else
            return Object.keys(this.files)
    }

    /**
     * Updates/refreshes all multilang elements.
     */
    public refresh() : void {
        this.elements.forEach((el) => {
            el.textContent = this.resolveTarget(el.getAttribute('mutlilang'))
        })
    }

    /**
     * Switch to a different language file
     * @param target Target language file to switch to, but not it's path, and excluding it's extension
     * @param retarget Reload multilang's target elements
     * @param reaquire Reload the langauge file (defaults to false)
     * @param callback Optional callback function, with boolean parameter for success or error.
     */
    public swap(target: string, retarget = false, reaquire = false, callback?: Function) : void {
        if (Object.keys(this.files).indexOf(target) === -1) {
            console.warn(`[MultiLang] No language file for target '${target}' was defined. Add it with '.addLanguage(file)', or get the list with '.list()'`)
            return
        }

        if (this.languages[target] === null || this.languages[target] === undefined)
            reaquire = true

        this.active = target

        if (retarget)
            this.retarget()

        if (reaquire === false) {
            this.refresh()
            if (callback !== null && callback !== undefined)
                callback(true)
        } else {
            let xmlhttp = new XMLHttpRequest()
            xmlhttp.overrideMimeType('application/json')
            xmlhttp.open('GET', this.files[target])
            xmlhttp.onreadystatechange = () => {
                if (xmlhttp.status === 200) {
                    this.refresh()
                    if (callback !== null && callback !== undefined)
                        callback(true)
                }
            }
            xmlhttp.onerror = () => {
                console.warn(`[MultiLang] Failed to get langaugefile, failed with error: '${xmlhttp.statusText}'`)
                callback(false)
            }
            xmlhttp.send()
        }
    }
}