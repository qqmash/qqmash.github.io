function check() {
    a1 = document.getElementById("1a").checked
    a2 = document.getElementById("2b").checked
    result = 0
    if (a1) result++
    if (a2) result++
    document.getElementById("result").innerHTML = result
}
