function writeFile(filename, content)
    local file = io.open(filename, "w")  -- Open the file in write mode
    if file then
        file:write(content)  -- Write the content to the file
        file:close()  -- Close the file
    else
        print("Error: Could not open file for writing.")
    end
end
function readFile(filename)
    local file = io.open(filename, 'r')
    if file then
        local content= file:read('*a')
        return content
    else
        print("Error: Can't found file.")
end
end
function loginMenu()
    x = gg.prompt({"Username: "}, nil, {"text"})
    