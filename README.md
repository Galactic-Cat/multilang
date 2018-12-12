# Multilang
A quick XMLHTTP solution for multiple languages on one page.

# Setting up
Firstly, import the MutiLang class.
```javascript
import MultiLang from 'catworks-multilang'
```
Then create the object:
```javascript
var multilang = new MultiLang([/* Array to Language files */])
```
Your language files should be JSON parse-able.

Let's take this `english.json` as an example.
```json
{
    "title": "A MultiLang Page"
}
```

Now if you have - somewhere in your DOM:
```html
<h1 multilang="title"></h1>
```
Then MultiLang will happily fetch your title and put it into your `<h1>` element.  
You can change the language later using:
```javascript
multilang.swap(/* language */)
```

### That's all for now folks.