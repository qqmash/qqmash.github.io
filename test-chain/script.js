function check() {
    a1 = document.getElementById("1a").checked
    a2 = document.getElementById("2b").checked
    result = 0
    if (a1) result++
    if (a2) result++
    document.getElementById("result").innerHTML = result
}

function next() {
    if (document.getElementById("q1").style.display == "block") {
        document.getElementById("q1").style.display = "none"
        document.getElementById("q2").style.display = "block"
        document.getElementById("q3").style.display = "none"
    }
    else if (document.getElementById("q2").style.display == "block") {
        document.getElementById("q1").style.display = "none"
        document.getElementById("q2").style.display = "none"
        document.getElementById("q3").style.display = "block"
    }
    else if (document.getElementById("q3").style.display == "block") {
        document.getElementById("q1").style.display = "none"
        document.getElementById("q2").style.display = "none"
        document.getElementById("q3").style.display = "none"

        document.getElementById("btn_next").style.display = "none"
        document.getElementById("btn_check").style.display = "block"
    }
}