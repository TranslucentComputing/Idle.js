#Idle.js main class
"use strict"
Idle = { }
class Idle
  @isAway: false
  #set default timeout to 3 seconds
  @awayTimeout: 3000
  @awayTimestamp: 0
  @awayTimer: null

  #events for monitoring user activity on the page
  @onAway: null
  @onAwayBack: null

  #events for the visibility API
  @onVisible: null
  @onHidden: null

  #Initialize the class
  #
  # @param (Object) options
  constructor: (options) ->
    if(options)
      @awayTimeout = parseInt options.awayTimeout, 10
      @onAway = options.onAway
      @onAwayBack = options.onAwayBack
      @onVisible = options.onVisible
      @onHidden = options.onHidden

    #object to be accessed in the events that will be called by window.
    activity = this
    @activeMethod = () ->
      activity.onActive()
    #the methods that we will use to know when there is some activity on the page
    window.addEventListener "onclick", @activeMethod
    window.addEventListener "onmousemove", @activeMethod
    window.addEventListener "onmouseenter", @activeMethod
    window.addEventListener "onkeydown", @activeMethod
    window.addEventListener "onscroll", @activeMethod
    window.addEventListener "onmousewheel", @activeMethod
    window.addEventListener "ontouchmove", @activeMethod
    window.addEventListener "ontouchstart", @activeMethod

  onActive: () ->
    @awayTimestamp = new Date().getTime() + @awayTimeout
    if(@isAway)
      #trigger callback for the user coming back from being away
      if(@onAwayBack)
        @onAwayBack()
      #reset the away timeout.
      @start()
    #ensure that the state is not away
    @isAway = false
    #return true for the event.
    return true

  start: () ->

    #setup events for page visibility api
    if (!@listener)   # only once even if start was called multiple times without stop
      @listener = (-> activity.handleVisibilityChange())
      document.addEventListener "visibilitychange", @listener, false
      document.addEventListener "webkitvisibilitychange", @listener, false
      document.addEventListener "msvisibilitychange", @listener, false

    @awayTimestamp = new Date().getTime() + @awayTimeout
    if (@awayTimer != null)
      clearTimeout @awayTimer
    activity = this
    #give the timer a 100ms delay
    @awayTimer = setTimeout (->
      activity.checkAway()), @awayTimeout + 100
    @

  stop: () ->
    window.removeEventListener "onclick", @activeMethod
    window.removeEventListener "onmousemove", @activeMethod
    window.removeEventListener "onmouseenter", @activeMethod
    window.removeEventListener "onkeydown", @activeMethod
    window.removeEventListener "onscroll", @activeMethod
    window.removeEventListener "onmousewheel", @activeMethod
    window.removeEventListener "ontouchmove", @activeMethod
    window.removeEventListener "ontouchstart", @activeMethod

    if (@awayTimer != null)
      clearTimeout @awayTimer
    if (@listener != null)
      document.removeEventListener "visibilitychange", @listener
      document.removeEventListener "webkitvisibilitychange", @listener
      document.removeEventListener "msvisibilitychange", @listener
      @listener = null
    @

  setAwayTimeout: (ms) ->
    @awayTimeout = parseInt ms, 10
    @

  checkAway: () ->
    t = new Date().getTime()
    if (t < @awayTimestamp)
      @isAway = false
      #not away yet, reset the timer with current awaytimestamp - current time with the 100ms delay
      activity = this
      @awayTimer = setTimeout (->
        activity.checkAway()), @awayTimestamp - t + 100
      return

    #away now
    if (@awayTimer != null)
      clearTimeout @awayTimer
    @isAway = true
    if(@onAway)
      @onAway()

  handleVisibilityChange: () ->
    #check for hidden for various browsers
    if(document.hidden || document.msHidden || document.webkitHidden)
      if(@onHidden)
        @onHidden()
    else
      if(@onVisible)
        @onVisible()

if typeof define == 'function' && define.amd
  # AMD
  define([], Idle)
else if typeof exports == 'object'
  # Node
  module.exports = Idle
else
  # Browser global
  window.Idle = Idle
