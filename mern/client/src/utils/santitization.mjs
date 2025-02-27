export default function SanitizeData(unsanitized){
        let sanitized = unsanitized.replaceAll(/[{}]/g, "")

        sanitized = sanitized.replace(/&/, '\u0026')
        sanitized = sanitized.replace(/</, '\u003C')
        sanitized = sanitized.replace(/>/, '\u003E')
        sanitized = sanitized.replace(/\$/, '\u0024')
        sanitized = sanitized.replace(/\\/, '\u005C')
        sanitized = sanitized.replace(/#/, '\u0023')
        sanitized = sanitized.replace(/\+/, '\u002B')
        sanitized = sanitized.replace(/\(/, '\u0028')
        sanitized = sanitized.replace(/\)/, '\u0029')
        sanitized = sanitized.replace(/~/, '\u007E')
        sanitized = sanitized.replace(/%/, '\u0025')
        sanitized = sanitized.replace(/\^/, '\u005E')
        sanitized = sanitized.replace(/:/, '\u003A')
        sanitized = sanitized.replace(/;/, '\u003B')
        sanitized = sanitized.replace(/\*/, '\u002A')
        sanitized = sanitized.replace(/\?/, '\u003F')
        sanitized = sanitized.replace(/@/, '\u0040')

        // \u002E
        
        sanitized = sanitized.replace(/'/, '\u02BC')

        return(sanitized);
        

}